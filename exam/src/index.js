function p(i) {
  return new Promise(resolve => setTimeout(resolve, 1000 / i));
}

async function f(i) {
  await p();
  console.log(i);
}
async function processArray(array) {
  for (let i = 1; i < 10; i++) {
    await f(i)
  }
}
