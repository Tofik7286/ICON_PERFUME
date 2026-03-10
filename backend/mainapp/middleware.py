from django.db.models.signals import pre_save, pre_delete
from django.dispatch import receiver
from django.utils.deprecation import MiddlewareMixin

class SetCustomUserMiddleware(MiddlewareMixin):
    def __call__(self, request):
        def set_saved_by_user(sender, instance, **kwargs):
                # Attach the current user to the instance on save
                instance._saved_by_user = request.user

        if (request.user.is_staff or request.user.is_superuser) and request.method in ["GET","POST", "PUT", "DELETE"]:

            # Connect signals for saving and deleting
            pre_save.connect(set_saved_by_user)

        response = self.get_response(request)

        # After the response is sent, disconnect the signals
        if (request.user.is_staff or request.user.is_superuser) and request.method in ["POST", "PUT", "DELETE"]:
            pre_save.disconnect(set_saved_by_user)


        return response
