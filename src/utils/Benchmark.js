/**
 * Utility for measuring and logging performance benchmarks.
 */
class Benchmark {
    constructor() {
        this.timers = new Map();
    }

    /**
     * Starts a benchmark session.
     * @param {string} label - Unique identifier for the timer.
     */
    start(label = "default") {
        this.timers.set(label, {
            startTime: process.hrtime(),
            startMemory: process.memoryUsage(),
        });
    }

    /**
     * Ends a benchmark session and returns the results.
     * @param {string} label - Label for the benchmark result.
     */
    stop(label = "default") {
        const timer = this.timers.get(label);
        if (!timer) {
            throw new Error(
                `Benchmark with label "${label}" has not been started.`,
            );
        }

        const end = process.hrtime(timer.startTime);
        const timeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2);
        const endMemory = process.memoryUsage();

        const memUsed = {
            rss: (
                (endMemory.rss - timer.startMemory.rss) /
                (1024 * 1024)
            ).toFixed(2),
            heapTotal: (
                (endMemory.heapTotal - timer.startMemory.heapTotal) /
                (1024 * 1024)
            ).toFixed(2),
            heapUsed: (
                (endMemory.heapUsed - timer.startMemory.heapUsed) /
                (1024 * 1024)
            ).toFixed(2),
        };

        console.log(`\n📊 [${label}]`);
        console.log(`⏱️  Execution Time: ${timeInMs}ms`);
        console.log(
            `🧠 Memory Usage Increase: RSS: ${memUsed.rss}MB, Heap: ${memUsed.heapUsed}MB / ${memUsed.heapTotal}MB`,
        );

        this.timers.delete(label);
        return { timeInMs, memUsed };
    }
}

module.exports = new Benchmark();
