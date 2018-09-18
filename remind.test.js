const join = require("path").join;

const remind = require(join(__dirname, "remind"));

test('adds 1 + 2 to equal 3', () => {
    expect(remind.sum(1, 2)).toBe(3);
});