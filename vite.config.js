import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	build: {
		outDir: "dist", // Output directory
		rollupOptions: {
			input: {
				main: resolve(__dirname, "server.js"), // Entry file in the root
			},
		},
		lib: {
			entry: resolve(__dirname, "server.js"),
			formats: ["cjs"],
			fileName: "server",
		},
		target: "node14",
	},
});
