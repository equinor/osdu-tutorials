# Best practices

## Logging
Code should be well logged and here is some tips that can help you:
* Use logger instead of print.
* Log all exceptions.
* Include in response exception the HTTP code and the message.
* Look at your if statements. Sometimes they silence exceptions.
* Include the key if you log KeyError.
* If some exceptions appears because of wrong user input, you should 
provide information what was wrong.

## Typing
You should define types of arguments for your functions and response 
type. Use `-> None` if you function does not returns any value.

## Documentation
Every function class and module should be documented. To verify your 
documentation use `pydoc`.

## Readme files
If you change functionality you should be sure that information about 
that functionality in readme files up to date.  