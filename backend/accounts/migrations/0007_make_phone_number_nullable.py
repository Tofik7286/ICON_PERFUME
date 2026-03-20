from django.db import migrations, models


def clear_temp_phone_numbers(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    CustomUser.objects.filter(phone_number__startswith='tmp').update(phone_number=None)
    CustomUser.objects.filter(phone_number='').update(phone_number=None)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alter_otp_otp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, null=True, unique=True),
        ),
        migrations.RunPython(clear_temp_phone_numbers, migrations.RunPython.noop),
    ]
