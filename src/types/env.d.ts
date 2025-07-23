declare namespace NodeJS {
  type ProcessEnv = {
    NODE_ENV: string;
    APPDATA?: string;
    LOCALAPPDATA?: string;
    XDG_DATA_HOME?: string;
    XDG_CACHE_HOME?: string;
    XDG_STATE_HOME?: string;
    XDG_CONFIG_HOME?: string;
  };
}
