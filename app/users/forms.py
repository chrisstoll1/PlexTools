from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super(UserRegisterForm, self).__init__(*args, **kwargs)

        for fieldname in ['username']:
            self.fields[fieldname].label = False
            self.fields[fieldname].help_text = False
        
        for fieldname in ['email']:
            self.fields[fieldname].label = False
            self.fields[fieldname].help_text = False
        
        for fieldname in ['password1']:
            self.fields[fieldname].label = False
        
        for fieldname in ['password2']:
            self.fields[fieldname].label = False

class ExtendedUserRegisterForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['discord']

    def __init__(self, *args, **kwargs):
        super(ExtendedUserRegisterForm, self).__init__(*args, **kwargs)
        
        for fieldname in ['discord']:
            self.fields[fieldname].label = False
        