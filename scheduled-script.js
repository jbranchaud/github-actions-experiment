const date = new Date;

const minutes = date.getMinutes();

if(minutes === 0) {
	process.exit(0)
} else {
	process.exit(1)
}
