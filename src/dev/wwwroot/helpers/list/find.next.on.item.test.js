var findNextOnItem = dev.helpers.list.findNextOnItem;
"use strict";
describe("dev.helpers.list.findNextOnItem", function () {
    it("should return the next item in the list after the given item.", function () {
        var b = { id: 2 };
        var c = { id: 3 };
        var list = [{ id: 1 }, b, c, { id: 4 }];
        expect(findNextOnItem(list, b)).toBe(c);
    });
});
//# sourceMappingURL=find.next.on.item.test.js.map