import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import presetAnimations from "unocss-preset-animations";
import { builtinColors, presetShadcn } from "unocss-preset-shadcn";

export default defineConfig({
  presets: [
    presetWind3({
      dark: "media",
    }),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        "display": "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetAnimations(),
    presetShadcn(builtinColors.map(c => ({ color: c }))),
  ],
  content: {
    pipeline: {
      include: ["vue", "svelte", "jsx", "tsx", "mdx", "astro", "html"],
    },
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    animation: {
      keyframes: {
        "light-sweep": `
          {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `
      },
      durations: {
        "light-sweep": "2s"
      },
      timingFns: {
        "light-sweep": "ease-in-out"
      },
      counts: {
        "light-sweep": "infinite"
      }
    }
  }
});
