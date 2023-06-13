const date = new Date;

const minutes = date.getMinutes();

if(minutes < 30) {
  console.log("Everything looks good here!")
} else {
  throw new Error("This script fails when it runs after the half-hour.")
}
