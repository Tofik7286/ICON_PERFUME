import os
import logging

from celery import Celery, Task

logger = logging.getLogger(__name__)

class LoggingTask(Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.exception('Task failed: %s' % exc, exc_info=exc)
        super(LoggingTask, self).on_failure(exc, task_id, args, kwargs, einfo)

class LoggingCelery(Celery):
    def task(self, *args, **kwargs):
        kwargs.setdefault('base', LoggingTask)
        return super(LoggingCelery, self).task(*args, **kwargs)
    
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
