using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class InputData : MonoBehaviour {

	public string userName;
    public string email;
	public string phone;
    public string pass1;
    public string pass2;

    private TouchScreenKeyboard keyboard;

    
    
    public void userNameField(string inputFieldString)
    {
        userName = inputFieldString;
        PlayerPrefs.SetString ("username", userName);
    }
    public void emailField(string inputFieldString)
    {
        email = inputFieldString;
        PlayerPrefs.SetString ("email", email);
    }
    public void phoneField(string inputFieldString)
    {
        phone = inputFieldString;
        PlayerPrefs.SetString ("phone", phone);
    }
    public void password1Field(string inputFieldString)
    {
        pass1 = inputFieldString;
        PlayerPrefs.SetString ("pass1", pass1);
    }
    public void password2Field(string inputFieldString)
    {
        pass2 = inputFieldString;
        PlayerPrefs.SetString ("pass2", pass2);
    }
}