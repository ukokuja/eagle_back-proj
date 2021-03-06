# Generated by Django 3.0.6 on 2020-07-04 04:55

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('common', '0001_initial'),
        ('trip', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Execution',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('modified_date', models.DateTimeField(auto_now=True)),
                ('duration', models.DurationField(blank=None, default=datetime.timedelta(0))),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('modified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('trip', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='trip.Trip')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Warning',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('modified_date', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(blank=None, max_length=127)),
                ('message', models.CharField(blank=None, max_length=255)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('execution', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='execution.Execution')),
                ('modified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('place', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='common.Place')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
