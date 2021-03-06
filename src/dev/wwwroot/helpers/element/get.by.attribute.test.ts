﻿var getByAttribute = dev.helpers.element.getByAttribute;

"use strict";

describe("dev.helpers.element.getElementByAttribute", function () {
    it("should get the first element (in the given container) containing the given attribute.", function () {
        var container = document.createElement("div");
        container.innerHTML = '<input type="text" test />';
        var input = container.firstElementChild;
        var result = getByAttribute(container, "test");
        
        expect(input).toBe(result);
    });
});