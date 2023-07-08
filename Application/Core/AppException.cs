namespace Application.Core;

public class AppException
{
    public int Statuscode { get; set; }
    public string Message { get; set; }
    public string Details { get; set; }

    public AppException(int statuscode, string message, string details = null)
    {
        Statuscode = statuscode;
        Message = message;
        Details = details;
    }
}