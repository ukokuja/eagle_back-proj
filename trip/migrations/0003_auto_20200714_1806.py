# Generated by Django 3.0.6 on 2020-07-14 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trip', '0002_auto_20200625_2218'),
    ]

    operations = [
        migrations.AddField(
            model_name='tripproperty',
            name='display_name',
            field=models.CharField(blank=None, default='', max_length=127),
        ),
        migrations.AlterField(
            model_name='trip',
            name='accessability',
            field=models.CharField(choices=[('HIGH', 'High Accessible'), ('MEDIUM', 'Medium Accessible'), ('LOW', 'Low Accessible')], default='HIGH', max_length=63),
        ),
        migrations.AlterField(
            model_name='trip',
            name='drone_list',
            field=models.ManyToManyField(blank=True, null=True, through='trip.TripDrone', to='trip.Drone'),
        ),
        migrations.AlterUniqueTogether(
            name='tripproperty',
            unique_together={('trip', 'key')},
        ),
    ]
