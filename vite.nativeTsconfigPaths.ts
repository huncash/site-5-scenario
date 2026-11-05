import type { ConfigEnv, PluginOption, UserConfig } from "vite";

function dropTsconfigPathsPlugin(plugins: PluginOption[] | undefined): PluginOption[] {
  const out: PluginOption[] = [];
  for (const item of plugins ?? []) {
    if (Array.isArray(item)) {
      out.push(...dropTsconfigPathsPlugin(item));
      continue;
    }
    if (item && typeof item === "object" && "name" in item && item.name === "vite-tsconfig-paths") {
      continue;
    }
    if (item) out.push(item);
  }
  return out;
}

/** Vite 8 natív tsconfig paths — a lovable wrapper vite-tsconfig-paths pluginjét levesszük. */
export function withNativeTsconfigPaths(
  configFn: (env: ConfigEnv) => UserConfig | Promise<UserConfig>,
) {
  return async (env: ConfigEnv): Promise<UserConfig> => {
    const config = await configFn(env);
    return {
      ...config,
      plugins: dropTsconfigPathsPlugin(config.plugins),
      resolve: {
        ...config.resolve,
        tsconfigPaths: true,
      },
    };
  };
}
