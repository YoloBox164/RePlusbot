export default function(number: number): number {
    return number + parseInt("1" + "0".repeat((number.toString().length - 2)));
}