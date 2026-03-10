import base64
import requests
import json
import math
import traceback


from django.conf import settings
from django.contrib import messages
from django.core.files import File
from io import BytesIO

from mainapp.models import *
from .utils import *
import logging
logger = logging.getLogger(__name__)



SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

def encode_token(token):
    return base64.b64encode(token.encode('utf-8')).decode('utf-8')

def decode_token(encoded_token):
    return base64.b64decode(encoded_token.encode('utf-8')).decode('utf-8')

def get_shiprocket_token():
    """Get a valid Shiprocket token, create one if not found or expired"""
    try:

        token_obj = ShiprocketToken.objects.latest('created_at')

        if token_obj.is_valid():
            # Decode and return the stored token
            return decode_token(token_obj.token)
        else:
            pass  # Token exists but is expired
    except ShiprocketToken.DoesNotExist:
        pass  # First time, no token exists

    # Request a new token
    url = f"{SHIPROCKET_BASE_URL}/auth/login"
    payload = {
        "email": settings.SHIPROCKET_EMAIL,
        "password": settings.SHIPROCKET_PASSWORD
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        raw_token = response.json().get('token')
        if not raw_token:
            return
        encoded_token = encode_token(raw_token)

        ShiprocketToken.objects.all().delete()  # optional: clear previous tokens
        ShiprocketToken.objects.create(token=encoded_token)

        return raw_token  # Return the decoded (usable) token
    else:
        return None

def get_minimum_courier_rate(pickup_postcode, delivery_postcode, cod, variants):
    try:
        token = get_shiprocket_token()
        # token = """eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjY0NDA5MTcsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzQ2NzA1ODE0LCJqdGkiOiJJcUhNd3Z4M2pMTFIxbTdUIiwiaWF0IjoxNzQ1ODQxODE0LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTc0NTg0MTgxNCwiY2lkIjo2MjIxNDk1LCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.J6vJ9RhrZGX_7-hQiydhl8ibDPpiyU-ugXbgsgGPIes"""
        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Bearer {token}"
        }
        url = f"{SHIPROCKET_BASE_URL}/courier/serviceability/"


        weight = 0
        height = 0
        breadths = []
        lengths = []

        for variant in variants:
            variant_id = variant.get('variant', {}).get('id')
            quantity = int(variant.get('quantity', 1))

            obj = ProductVariant.objects.get(id=variant_id)
            product = obj.product
            if product.weight:
                weight += float(product.weight) * quantity
            if product.height:
                height += float(product.height) * quantity

            if product.breadth:
                breadths.append(float(product.breadth))
            if product.length:
                lengths.append(float(product.length)) 

        breadth = max(breadths) if breadths else 0 
        length = max(lengths) if lengths else 0
        actual_weight = max(float(round(weight / 1000,4)),0.5)  # Convert to KG if weight was in grams
        volumetric_weight = float(round(length * breadth * height / 5000,2))
        chargable_weight = max(actual_weight, volumetric_weight)
        chargable_weight = math.ceil(chargable_weight * 2) / 2
            
        payload = {
            "pickup_postcode": pickup_postcode,
            "delivery_postcode": delivery_postcode,
            "cod": cod,
            "weight": chargable_weight,
            "height": height,
            "breadth": breadth,
            "length": length
        }
        response = requests.get(url, headers=headers, params=payload)
        
        # if response.status_code != 200:
        #     raise Exception(f"Failed to fetch courier rates: {response.json.message}")
        if response.json().get("status") == 200:
            companies_data = response.json()["data"]["available_courier_companies"]
            min_company = min(companies_data, key=lambda x: x["rate"])
            
            return {
                "company_id": min_company["courier_company_id"],
                "company_name": min_company["courier_name"],
                "company_rate": 45
            }
        else:
            return {
                "company_id": "1",
                "company_name": "Default Courier",
                "company_rate": 45
            }
            error_message = response.json().get("message", "Unknown error occurred.")
            raise Exception(f"Courier API Error: {error_message}")
    except Exception as e:
        traceback.print_exc() 
        logger.exception("Unexpected error")
def push_order_to_shiprocket(
    request,order_id,billing_customer_name,billing_address,
    billing_city,billing_pincode,billing_state,billing_country,
    billing_email,billing_phone,payment_method,shipping_charges,
    discount,sub_total,length,breadth,height,weight,token
    ):
    try:
        order = Order.objects.get(id=order_id)
        order_items = OrderItem.objects.filter(order=order)

        items = []

        if not order_items.exists():
            return {'success':False,'message':'No Order Items Found'}
      
        for item in order_items:
            order_item = {
                "name":str(item.variant),
                "sku":str(item.variant.sku),
                "units":int(item.quantity),
                "selling_price": round(float(item.variant.discounted_price), 2),  # no int()
                "discount": round(float(item.discount), 2),
                "tax":0,
                "hsn":int(item.variant.hsn_code) if item.variant.hsn_code else 4202,  # default but it has to generate and different for every product
            }
            items.append(order_item)

        url = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }

        payload = json.dumps({
            "order_id":str(order.order_number),
            "order_date":str(order.order_date),
            "pickup_location":"Secondary",
            "channel_id":'',
            "comment":"",
            "billing_customer_name":str(billing_customer_name),
            "billing_last_name":"",
            "billing_address":str(billing_address),
            "billing_address_2":"",
            "billing_city":str(billing_city),
            "billing_pincode":str(billing_pincode),
            "billing_state":str(billing_state),
            "billing_country":str(billing_country),
            "billing_email":str(billing_email),
            "billing_phone":str(billing_phone),
            "shipping_is_billing":True,
            "shipping_customer_name":"",
            "shipping_last_name":"",
            "shipping_address":"",
            "shipping_address_2":"",
            "shipping_city":"",
            "shipping_pincode":"",
            "shipping_country":"",
            "shipping_state":"",
            "shipping_email":"",
            "shipping_phone":"",
            "order_items":items,
            "payment_method":payment_method if payment_method == "COD" else 'Prepaid',
            "shipping_charges":int(shipping_charges),
            "giftwrap_charges":0,
            "transaction_charges":0,
            "total_discount":round(float(discount), 2),
            "sub_total":round(float(sub_total + discount),2),
            "length":float(length),
            "breadth":float(breadth),
            "height":float(height),
            "weight":float(weight)
        })
        runn = False
        shipment_id = None
        shiprocket_order_id = None
        if not order.shipment_id:
           response = requests.post(url, headers=headers, data=payload)
           runn = True
           if response.status_code == 200:
              order_info = response.json()
              shipment_id = order_info.get('shipment_id')
              shiprocket_order_id = order_info.get('order_id')
              order.shiprocket_order_id = shiprocket_order_id
              order.shipment_id = shipment_id
              order.save()
        
        if runn == True or order.shipment_id:
            # Assign the AWB Code 
            if not shipment_id:
                shipment_id = order.shipment_id
            if not order.awb_code:
                generate_awb_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=order_id, shiprocket_order_id=shiprocket_order_id)                

            # REQUEST FOR SHIPMENT
            if not order.pickup_status:
                request_shipment_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=order_id)

            # GENERATE MANIFEST
            if not order.manifest:
                generate_manifest_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=order_id)

            # GENERATE LABLE
            if not order.label:
                generate_label_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=order_id)

            # GENERATE SHIPROCKET INVOICE
            if not order.shiprocket_invoice:
                generate_shiprocket_invoice(request=request,ship_token=token, order_id=order_id, ship_order_id=shiprocket_order_id)

    except Exception as e:
        messages.error(request=request, message=f"Internal server error-:{str(e)}")

def generate_shiprocket_invoice(request,ship_token,order_id,ship_order_id):
    try:
        url = "https://apiv2.shiprocket.in/v1/external/orders/print/invoice"

        payload = json.dumps({
            "ids":[
                int(ship_order_id)
            ]
        })
        headers = {
            'Content-Type': 'application/json',
            'Authorization':f"Bearer {ship_token}"
        }

        response = requests.post(url, data=payload, headers=headers)

        api_response = response.json()

        if api_response['is_invoice_created'] == True or api_response['is_invoice_created'] == "true":
            invoice_url = re.sub(r'\\/','/',api_response['invoice_url'])

            response = requests.get(invoice_url)

            if response.status_code == 200:
                temp_file = BytesIO(response.content)

                obj = Order.objects.get(id=order_id)
                invoice_file = 'SRIV' + str(order_id) + '.pdf'

                obj.shiprocket_invoice.save(invoice_file,File(temp_file),save=True)
            else:
                messages.error(request=request, message="Something went wrong while generating shiprocket invoice")
        else:
            messages.error(request=request, message="Something went wrong while generating shiprocket invoice")

    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")
    except Exception as e:
        messages.error(request=request, message=f'Internal server error while generating shiprocket invoice-:{str(e)}')

def generate_awb_shiprocket(request,order_id,ship_token,shipment_id,shiprocket_order_id,is_return=False):
    try:
        if is_return is True:
            order = ReturnExchange.objects.get(id=order_id)
        else:
            order = Order.objects.get(id=order_id)

        order.shipment_id = shipment_id
        order.shiprocket_order_id = shiprocket_order_id  
        order.save()

        awb_url = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb"

        payload = {
            "shipment_id":int(shipment_id),            
        }

        if is_return is True:
            payload["is_return"] = 1
        else:
            courier_id = order.courier_company_id
            payload["courier_id"] = int(courier_id)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {ship_token}'
        }

        response = requests.post(awb_url, json=payload, headers=headers)

        if response.status_code != 200:
            messages.error(request=request,message="Something went wrong while generating AWB Code.")
            return
        
        awb_info = response.json()
        awb_code = awb_info.get('response',{}).get('data',{}).get('awb_code')
        order.awb_code = awb_code
        order.save()

    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")    
    except Exception as e:
        messages.error(request=request, message=f'Internal Server Error While Generating AWB {str(e)}')
   

def generate_manifest_shiprocket(request,shipment_id,ship_token,order_id,is_return=False):
    try:
        url = "https://apiv2.shiprocket.in/v1/external/manifests/generate"
 
        payload = {
            "shipment_id":[
                int(shipment_id)
            ]
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {ship_token}'
        }

        response = requests.post(url,headers=headers,json=payload)

        api_response = response.json()

        if api_response['status'] != 1:
            messages.error(request=request,message=f"Something went wrong while generating Manifest")
            return

        manifest_url = re.sub(r'\\/','/',api_response['maifest_url'])
        response = requests.get(manifest_url)
        if response.status_code != 200:
            messages.error(request=request,message=f"Something went wrong while generating Manifest")
            return
        temp_file = BytesIO(response.content)
        if is_return is False:
            obj = Order.objects.get(id=order_id)
            manifest_file = 'MFF' + str(order_id) + '.pdf'
        else:
            obj = ReturnExchange.objects.get(id=order_id)
            manifest_file = 'MFF' + str(order_id) + '.pdf'
        obj.manifest.save(manifest_file,File(temp_file),save=True)

    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")    
    except Exception as e:
        messages.error(request=request,message=f"Internal Server Error While Geneating Manifest {str(e)}")


def generate_label_shiprocket(request, shipment_id,ship_token,order_id,is_return=False):
    try:
        url = "https://apiv2.shiprocket.in/v1/external/courier/generate/label"

        payload = {
            "shipment_id":[
                int(shipment_id)
            ]
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization':f'Bearer {ship_token}'
        }

        response = requests.post(url, json=payload, headers=headers)

        api_response = response.json()
        if api_response['label_created'] != 1:
            messages.error(request=request,message="Something went wrong while generating label")
            return
        
        label_url = re.sub(r'\\/','/',api_response['label_url'])
        response = requests.get(label_url)

        if response.status_code != 200:
            messages.error(request=request,message="Something went wrong while generating label")
            return
        temp_file = BytesIO(response.content)
        if is_return is False:
            obj = Order.objects.get(id=order_id)
            label_file = "LBL" + str(order_id) + '.pdf'
        else:
            obj = ReturnExchange.objects.get(id=order_id)
            label_file = "LBL" + str(order_id) + '.pdf'
        obj.label.save(label_file,File(temp_file),save=True)

    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")    
    except Exception as e:
        messages.error(request=request,message=f'Internal server error while generating label-:{str(e)}')

def request_shipment_shiprocket(request, shipment_id,ship_token,order_id,is_return=False):
    try:
        url = "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup"

        payload = {
            "shipment_id":[
                int(shipment_id),
            ]
        }

        headers = {
            'Content-Type':'application/json',
            'Authorization':f'Bearer {ship_token}'
        }

        response = requests.post(url,headers=headers,json=payload)

        if response.status_code != 200:
            messages.error(request=request,message="Something went wrong while requesting for Shipment")
            return
        
        response_data = response.json()

        pickup_status = response_data.get('pickup_status')
        response_data_response = response_data.get('response')
        pickup_scheduled_date = response_data_response.get('pickup_scheduled_date')
        pickup_token_number = response_data_response.get('pickup_token_number')

        if is_return is False:
            obj = Order.objects.get(id=order_id)
            obj.pickup_status = pickup_status
            obj.pickup_schedule_date = pickup_scheduled_date
            obj.pickup_token_number = pickup_token_number
        else:
            obj = ReturnExchange.objects.get(id=order_id)
            obj.pickup_status = pickup_status
            obj.pickup_schedule_date = pickup_scheduled_date
            obj.pickup_token_number = pickup_token_number
        obj.save()

    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")
    except Exception as e:
        messages.error(request=request,message=f"Internal server error while requesting for Shipment-:{str(e)}")


def create_return_order_shiprocket(request, order_id,order_item_id,return_exchange_id):
    try:
        return_order_url = "https://apiv2.shiprocket.in/v1/external/orders/create/return"
        token = get_shiprocket_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

        order = Order.objects.get(id=order_id)
        order_item = OrderItem.objects.get(id=order_item_id)
        return_exchange = ReturnExchange.objects.get(id=return_exchange_id)

        quantity = order_item.quantity
        product = order_item.variant.product

        total_weight = 0.0  # in KG
        max_length = 0.5  # in CM
        max_breadth = 0.5  # in CM
        total_height = 0.5  # in CM

        # Weight (already in KG)
        if product.weight:
            total_weight += float(product.weight) * quantity
        else:
            total_weight = 0.5
        # Dimensions in inches — convert to CM (1 inch = 2.54 cm)
        length = float(product.length) if product.length else 0
        breadth = float(product.breadth) if product.breadth else 0
        height = float(product.height) if product.height else 0

        # Apply minimum of 0.5 cm
        length = max(length, 0.5)
        breadth = max(breadth, 0.5)
        height = max(height, 0.5)

        # Accumulate dimensions
        max_length = max(max_length, length)
        max_breadth = max(max_breadth, breadth)
        total_height += height * quantity

        # Volumetric weight formula (in KG): (L x B x H) / 5000
        volumetric_weight = round((max_length * max_breadth * total_height) / 5000, 2)

        # Chargable weight: max of actual or volumetric, rounded up to nearest 0.5 kg
        chargeable_weight = max(total_weight, volumetric_weight)
        chargeable_weight = math.ceil(chargeable_weight * 2) / 2  # Round up to nearest 0.5 kg

        sub_total = (order_item.variant.discounted_price * Decimal(order_item.quantity))

        return_payload = {
            "order_id": "RO" + order.order_number,
            "order_date": order.created_at.strftime("%Y-%m-%d"),
            "channel_id": "",  # Replace with your actual channel ID
            "pickup_customer_name": order.name,
            "pickup_last_name": "",
            "pickup_address":order.address,
            "pickup_city": order.city,
            "pickup_state": order.state,
            "pickup_country": order.country,
            "pickup_pincode": order.pincode,
            "pickup_email": order.email,
            "pickup_phone": order.phone_number,
            "shipping_customer_name": SHIPPING_CUSTOMER_NAME,
            "shipping_address": SHIPPING_ADDRESS,
            "shipping_city": SHIPPING_CITY,
            "shipping_state": SHIPPING_STATE,
            "shipping_country": SHIPPING_COUNTRY,
            "shipping_pincode": SHIPPING_PINCODE,
            "shipping_phone": SHIPPING_PHONE,
            "payment_method": "Prepaid",
            "qc_enable": True,
            "qc_product_name": order_item.variant.product.title,
            "qc_product_image": WEB_URL_FOR_IMAGES + order_item.variant.images.first().image.url if order_item.variant.images and order_item.variant.images.first().image else "",
            "qc_brand": "Icon Perfumes",
            "qc_color": "",
            "qc_size": "",
            "accessories": "",
            "qc_used_check": "0",
            "return_reason":"",
            "sub_total": float(sub_total), 
            "length": max_length,
            "breadth": max_breadth,
            "height": total_height,
            "weight": chargeable_weight,
            "order_items": [
                {
                    "name":str(order_item.variant.product.title),
                    "sku":str(order_item.variant.sku),    
                    "units": order_item.quantity,
                    "selling_price": round(float(order_item.variant.discounted_price), 2),  # no int()
                    "discount": round(float(order_item.discount), 2),        
                    "tax":0,
                    "hsn":int(order_item.variant.hsn_code) if order_item.variant.hsn_code else 4202,  # default but it has to generate and different for every product
                }
            ]
        }
        runn = False
        shipment_id = None
        shiprocket_order_id = None
        if not return_exchange.shipment_id:
           response = requests.post(return_order_url, headers=headers, json=return_payload)
           runn = True
           if response.status_code == 200:
              order_info = response.json()
              shipment_id = order_info.get('shipment_id')
              shiprocket_order_id = order_info.get('order_id')
              return_exchange.shiprocket_order_id = shiprocket_order_id
              return_exchange.shipment_id = shipment_id
              return_exchange.save()
        
        if runn == True or return_exchange.shipment_id:
            # Assign the AWB Code 
            if not shipment_id:
                shipment_id = return_exchange.shipment_id
            if not return_exchange.awb_code:
                generate_awb_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=return_exchange_id, shiprocket_order_id=shiprocket_order_id,is_return=True)                

            # REQUEST FOR SHIPMENT
            if not return_exchange.pickup_status:
                request_shipment_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=return_exchange_id,is_return=True)

            # GENERATE MANIFEST
            if not return_exchange.manifest:
                generate_manifest_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=return_exchange_id,is_return=True)

            # GENERATE LABLE
            if not return_exchange.label:
                generate_label_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=return_exchange_id,is_return=True)

            # GENERATE SHIPROCKET INVOICE
            if not return_exchange.shiprocket_invoice:
                generate_shiprocket_invoice(request=request,ship_token=token, order_id=return_exchange_id, ship_order_id=shiprocket_order_id,is_return=True)

        messages.success(request=request,message=f'Return Request Generated for Return/Exchange : {return_exchange.id}')
        
    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order not found with ID : {order_id}")    
    except Exception as e:
        messages.error(request=request, message=f"Internal Server Error while Creating Return Order : {str(e)}")


def create_exchange_order_shiprocket(request, return_exchange_id, order_item_id):
    try:
        order_item = OrderItem.objects.get(id=order_item_id)
        return_exchange = ReturnExchange.objects.get(id=return_exchange_id)
        order = order_item.order
        product = order_item.variant.product
        variant = order_item.variant
        token = get_shiprocket_token()

        # Basic buyer info
        first_name = order.name.split(" ")[0]
        last_name = " ".join(order.name.split(" ")[1:]) or ""
        phone = order.phone_number
        email = order.email

        # Length, breadth, height (in cm) and weight (in kg)
        return_length = float(product.length or 1)
        return_breadth = float(product.breadth or 1)
        return_height = float(product.height or 1)
        return_weight = float(product.weight or 0.5)

        # For exchange product dimensions – assuming same as return unless you store replacement details separately
        exchange_length = return_length
        exchange_breadth = return_breadth
        exchange_height = return_height
        exchange_weight = return_weight

        #TODO:
        # Shiprocket seller location ID (replace with your actual ID)
        SELLER_LOCATION_ID = "5723898"  

        payload = {
            "exchange_order_id": f"EO-{order.order_number}",
            "seller_pickup_location_id": SELLER_LOCATION_ID,
            "seller_shipping_location_id": SELLER_LOCATION_ID,
            "return_order_id": f"RE{order.order_number}",
            "order_date": order.order_date.strftime("%Y-%m-%d"),
            "payment_method": "Prepaid",

            # Shipping info
            "buyer_shipping_first_name": first_name,
            "buyer_shipping_last_name": last_name,
            "buyer_shipping_email": email,
            "buyer_shipping_address": order.address,
            "buyer_shipping_city": order.city,
            "buyer_shipping_state": order.state,
            "buyer_shipping_country": order.country,
            "buyer_shipping_pincode": order.pincode,
            "buyer_shipping_phone": phone,

            # Pickup info
            "buyer_pickup_first_name": first_name,
            "buyer_pickup_last_name": last_name,
            "buyer_pickup_email": email,
            "buyer_pickup_address": order.address,
            "buyer_pickup_city": order.city,
            "buyer_pickup_state": order.state,
            "buyer_pickup_country": order.country,
            "buyer_pickup_pincode": order.pincode,
            "buyer_pickup_phone": phone,

            "order_items": [
                {
                    "name": variant.product.title,
                    "selling_price": float(order_item.variant.discounted_price),
                    "units": order_item.quantity,
                    "hsn": variant.hsn_code or "000000",  # Default or real HSN code
                    "sku": variant.sku,
                    "exchange_item_name": variant.product.title,
                    "exchange_item_sku": variant.sku,
                }
            ],

            "sub_total": float(order_item.variant.discounted_price * Decimal(order_item.quantity)),
            "return_length": return_length,
            "return_breadth": return_breadth,
            "return_height": return_height,
            "return_weight": return_weight,
            "exchange_length": exchange_length,
            "exchange_breadth": exchange_breadth,
            "exchange_height": exchange_height,
            "exchange_weight": exchange_weight,

            "return_reason": "",
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        runn = False
        shipment_id = None
        shiprocket_order_id = None
        if not return_exchange.shipment_id:
            runn = True
            response = requests.post(
                "https://apiv2.shiprocket.in/v1/external/orders/create/exchange",
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                order_info = response.json()
                shipment_id = order_info.get('shipment_id')
                shiprocket_order_id = order_info.get('order_id')
                return_exchange.shiprocket_order_id = shiprocket_order_id
                return_exchange.shipment_id = shipment_id
                return_exchange.save()
        
        if runn == True or return_exchange.shipment_id:
            # Assign the AWB Code 
            if not shipment_id:
                shipment_id = return_exchange.shipment_id
            if not return_exchange.awb_code:
                generate_awb_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=return_exchange_id, shiprocket_order_id=shiprocket_order_id,is_return=True)                

            # REQUEST FOR SHIPMENT
            if not return_exchange.pickup_status:
                request_shipment_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=return_exchange_id,is_return=True)

            # GENERATE MANIFEST
            if not return_exchange.manifest:
                generate_manifest_shiprocket(request=request,shipment_id=shipment_id,ship_token=token, order_id=return_exchange_id,is_return=True)

            # GENERATE LABLE
            if not return_exchange.label:
                generate_label_shiprocket(request=request,shipment_id=shipment_id,ship_token=token,order_id=return_exchange_id,is_return=True)

            # GENERATE SHIPROCKET INVOICE
            if not return_exchange.shiprocket_invoice:
                generate_shiprocket_invoice(request=request,ship_token=token, order_id=return_exchange_id, ship_order_id=shiprocket_order_id,is_return=True)

        messages.success(request=request,message=f'Return Request Generated for Return/Exchange : {return_exchange.id}')
        
        
    except Order.DoesNotExist:
        messages.error(request=request,message=f"Order Item not found with ID : {order_item_id}")    
    except Exception as e:
        messages.error(request=request, message=f"Internal Server Error while Creating Return Order : {str(e)}")
