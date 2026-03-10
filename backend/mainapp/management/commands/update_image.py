import os

from django.core.management.base import BaseCommand
from django.conf import settings
from mainapp.models import ProductVariant, ProductImage
from io import BytesIO
from django.core.files import File

class Command(BaseCommand):
    help = 'Update Product Images'

    def handle(self, *args, **options):
        try:
            self.stdout.write("Updating Images")
            _5ml_images = os.listdir(os.path.join(settings.BASE_DIR,'media','5ml'))
            _6ml_images = os.listdir(os.path.join(settings.BASE_DIR,'media','6ml'))
            variants = ProductVariant.objects.all()
            _5ml = variants.filter(product__category__name__in=['5 ml'])
            _6ml = variants.filter(product__category__name__in=['6 ml'])
            for i in _5ml:
                prod_name = i.product.title.lower().split("roll")[0]
                for img in _5ml_images:
                    if prod_name in img.lower():
                        self.stdout.write("found")
                        img_path = os.path.join(settings.BASE_DIR,'media','5ml',img)
                        with open(img_path,'rb') as f:
                            self.stdout.write('saving')
                            image = ProductImage.objects.create(variant=i)
                            image.image.save(name=img.strip(),content=File(f))
                            image.save()
                            self.stdout.write(f"image: {image}")

            for i in _6ml:
                prod_name = i.product.title.lower().split("roll")[0]
                for img in _6ml_images: 
                    if prod_name in img.lower():
                        img_path = os.path.join(settings.BASE_DIR,'media','6ml',img)
                        with open(img_path,'rb') as f:
                            image = ProductImage.objects.create(variant=i)
                            image.image.save(name=img.strip(),content=File(f))
                            image.save()
        except Exception as e:
            self.stderr.write(f"Error: {str(e)}")
