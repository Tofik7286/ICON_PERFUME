from django.db import migrations


def activate_verified_inactive_users(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    # Old profile OTP flow could leave verified users inactive and unable to authenticate.
    # Keep truly unverified signups untouched (usually is_new=True).
    CustomUser.objects.filter(is_active=False, is_new=False).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_make_phone_number_nullable'),
    ]

    operations = [
        migrations.RunPython(activate_verified_inactive_users, migrations.RunPython.noop),
    ]
