import { config } from "./config.jsx";

/** One block for page data, with the block's default settings filled in. */
export function makeBlock(type, props = {}) {
  return {
    type,
    props: {
      ...config.components[type].defaultProps,
      id: `${type}-${crypto.randomUUID()}`,
      ...props,
    },
  };
}
