# Generated by Django 3.0.6 on 2020-07-19 22:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trip', '0008_destination_is_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='destination',
            name='start_time',
            field=models.TimeField(),
        ),
        migrations.AlterField(
            model_name='destination',
            name='stop_time',
            field=models.TimeField(),
        ),
    ]
