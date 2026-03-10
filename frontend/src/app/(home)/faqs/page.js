import React from 'react'
import PageHeader from '../components/PageHeader'
import styles from '../styles/content_pages.module.css'
import Breadcrumb from '../components/BreadCrumb'
import Faq from '../components/Faq'

export const metadata = {
    alternates: {
        canonical: `https://www.iconperfumes.in/faqs/`,
    }
};

function page() {
    const faq_list = [
        {
            name: "General",
            list: [
                { q: "What types of leather bags do you offer?", a: "We offer a wide range of leather bags, including:", list: ["Handbags", "Laptop bags", "Mobile holders", "Totes", "Document holders", "Card holders", "And more"] },
                { q: "How can I contact customer support?", a: "You can reach us via email at support@iconperfumes.in. Our team is available Monday to Friday, 9 AM–5 PM (GMT)." },
                { q: "How can I place an order?", a: "Simply browse our collection, select your preferred item, add it to your cart, and proceed to checkout." },
                { q: "What payment methods do you accept?", a: "We accept Stripe payments, allowing you to securely pay using major debit/credit cards and other trusted payment options." },
                { q: "Is my payment information secure?", a: "Yes! We use SSL encryption and Stripe's secure payment gateway to ensure all transactions are protected." },
            ]
        },
        {
            name: "Shipping & Delivery",
            list: [
                { q: "Do you ship across the UK?", a: "Yes, we deliver nationwide across the UK, including both metro and regional areas." },
                { q: "How long will it take for my order to arrive?", a: <ul className='list-disc'><li><b>Within India:</b> Orders are delivered within 5 business days.</li><li><b>International Shipping:</b> Orders are delivered within up to 10 business days (depending on the destination and customs processing).</li><li>🚨 <b>Please note:</b> Business days do not include weekends or public holidays.</li></ul> },
                { q: "Can I track my order?", a: "Yes, a tracking link will be sent to your email once your order is dispatched." },
            ]
        },
        {
            name: "Returns & Refunds",
            list: [
                { q: "What is your return and exchange policy?", a: <ul className='list-disc'><li><b>Returns:</b> We accept returns within 5 days of delivery for unused items in their original packaging.</li><li><b>Exchanges:</b> We process exchanges within 7–10 business days.</li></ul> },
                { q: "What items are non-returnable?", a: "Custom-made products, clearance items, and gift cards are not eligible for returns or exchanges." },
                { q: "How do I initiate a return or exchange?", a: "Contact us at support@iconperfumes.in with your order number and the reason for the return or exchange. Our team will assist you with the process." },
                { q: "Do you offer refunds?", a: "No, we do not provide refunds. However, we offer exchanges for eligible items within the return window." },
                { q: "When will I receive my exchange or return?", a: "Returns or Exchanges are processed within 7–10 business days." },
            ]
        },
        {
            name: "Privacy & Security",
            list: [
                { q: "What personal data do you collect?", a: "We collect basic information such as your name, email, shipping address, and payment details to process your orders." },
                { q: "How do you ensure my data is secure?", a: "We use advanced encryption technologies and follow strict data protection guidelines under the UK’s Data Protection Act 2018." },
                { q: "Can I opt out of marketing emails?", a: "Yes, you can unsubscribe at any time by clicking the 'Unsubscribe' link in our emails." },
            ]
        },
        {
            name: "Product Care & Customization",
            list: [
                { q: "How do I care for my leather bag?", a: <ul className='list-disc'><li>Clean your bag with a damp cloth and mild leather cleaner.</li><li>Store it in a cool, dry place away from direct sunlight.</li><li>Use a leather conditioner to maintain its texture and longevity.</li></ul> },
                { q: "Do your bags come with a warranty?", a: "Yes, all our leather bags come with a 1-year warranty against manufacturing defects." },
                { q: "Do you offer gift wrapping?", a: "Yes, gift wrapping is available at checkout with no additional fee." },
                { q: "Can I customise a leather bag?", a: "Yes, we offer customization options on select leather bags. Contact our support team for more details." },
            ]
        }
    ];
  return (
    <>
    <div className='padd-x'>
        <Faq faq_list={faq_list} page={"faq"}/>
    </div>
    </>
  )
}

export default page
