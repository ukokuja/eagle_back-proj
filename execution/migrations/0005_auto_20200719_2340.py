# Generated by Django 3.0.6 on 2020-07-19 23:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('execution', '0004_auto_20200719_2224'),
    ]

    operations = [
        migrations.AlterField(
            model_name='warning',
            name='level',
            field=models.CharField(choices=[('4', 'HIGH'), ('3', 'MEDIUM'), ('2', 'LOW'), ('1', 'INFO')], default=1, max_length=63),
        ),
        migrations.AlterField(
            model_name='warning',
            name='radius',
            field=models.FloatField(default=0.1),
        ),
        migrations.AlterField(
            model_name='warningaction',
            name='action',
            field=models.CharField(choices=[('ignore', 'ignore'), ('escalate', 'escalate'), ('snooze', 'snooze')], default='ignore', max_length=63),
        ),
    ]
