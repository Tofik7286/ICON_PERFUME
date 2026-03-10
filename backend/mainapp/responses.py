from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Standard success response format."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return Response(response, status=status_code)


def error_response(message="Something went wrong", status_code=status.HTTP_400_BAD_REQUEST):
    """Standard error response format."""
    return Response({"success": False, "message": message}, status=status_code)
