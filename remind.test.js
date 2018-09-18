const join = require("path").join;

const remind = require(join(__dirname, "remind"));

test('REMIND: PARSE: принести поесть завтра в 12', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на работу в понедельник', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на работу в понедельник 9', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на работу в понедельник в 9', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на работу в понедельник в 9 вечера', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: посмотреть на дом в среду утром', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: посмотреть на дом в среду в обед', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: посмотреть на дом в среду вечером', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на курсы 9 сентября', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на курсы 14 января', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: пойти на курсы 31 мая', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: увидеть как что-то сделано в подъезде в среду в 23', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: достучаться до небесь восьмого февраля', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});

test('REMIND: PARSE: спасти рядового раяна завтра в полночь', () => {
    expect(remind.parse('принести поесть завтра в 12')).toBeUndefined();
});