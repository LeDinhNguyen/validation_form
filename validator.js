function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;
        // get rule of the selector
        var rules = selectorRules[rule.selector];
        // go through each rule and check
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add("invalid")
        } else {
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true;

            // go through rules and validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            })

            if (isFormValid) {
                // Submit with JS
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]:not([disabled])")
            
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                }
                // Submit by default
                else {
                    formElement.submit();
                }
            }
        }

        // go through each rule and process
        options.rules.forEach(function (rule) {

            // save rules for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                // Blur Input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                // When user oninput
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
                }
            }
        })
    }
}

// Initialize Rules
/*
1. Error => return Error message
2. Valid => Return Undefined
*/
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined: message || "Nhap ten di em"
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined: message || "Nhap lai email di em"
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined: message || `Nhap nhieu hon ${min} ki tu`
        }
    };
}

Validator.isComfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined: message || `Gia tri nhap vao khong chinh xac`
        }
    };
}