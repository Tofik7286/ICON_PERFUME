from django.core.management.base import BaseCommand
from mainapp.models import ProductCategory


class Command(BaseCommand):
    help = 'Add navbar categories: 5 ML ROLL ON, 6 ML ROLL ON, and Limestick'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🔄 Adding navbar categories...'))
        
        # Check if "Roll On" parent category exists, if not create it
        roll_on_parent, created = ProductCategory.objects.get_or_create(
            name="Roll On",
            parent=None,
            defaults={
                'meta_title': 'Roll On Perfumes',
                'meta_description': 'Shop our collection of roll on perfumes',
                'index': True,
                'follow': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created parent category: {roll_on_parent.name}'))
        else:
            self.stdout.write(f'ℹ️  Parent category "{roll_on_parent.name}" already exists')

        # Create subcategories under Roll On
        categories_to_add = [
            {
                'name': '5 ML ROLL ON',
                'parent': roll_on_parent,
                'meta_title': '5 ML Roll On Perfumes',
                'meta_description': 'Shop 5 ML roll on perfumes - portable and convenient',
            },
            {
                'name': '6 ML ROLL ON',
                'parent': roll_on_parent,
                'meta_title': '6 ML Roll On Perfumes',
                'meta_description': 'Shop 6 ML roll on perfumes - portable and convenient',
            },
        ]

        for cat_data in categories_to_add:
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                parent=cat_data['parent'],
                defaults={
                    'meta_title': cat_data['meta_title'],
                    'meta_description': cat_data['meta_description'],
                    'index': True,
                    'follow': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Created category: {category.name}'))
            else:
                self.stdout.write(f'ℹ️  Category "{category.name}" already exists')

        # Check if "Limestick" parent category exists (standalone, no parent)
        limestick, created = ProductCategory.objects.get_or_create(
            name="Limestick",
            parent=None,
            defaults={
                'meta_title': 'Limestick Products',
                'meta_description': 'Shop our Limestick collection',
                'index': True,
                'follow': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created category: {limestick.name}'))
        else:
            self.stdout.write(f'ℹ️  Category "{limestick.name}" already exists')

        self.stdout.write(self.style.SUCCESS('\n🎉 All navbar categories added successfully!'))
