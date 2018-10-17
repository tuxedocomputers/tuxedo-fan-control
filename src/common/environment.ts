/**
 * Class for storing Objects in environment.
 */
export class Environment
{
    private static daemonMode: boolean = false;
    private static environment: {name: string, object: any, mode: string}[] = [];

    /**
     * Get the current environment
     *
     * @returns A object array, with the objects and names
     */
    public static getEnvironment(): {name: string, object: any}[]
    {
        return this.environment.filter(x => x.mode === (this.daemonMode ? "daemon" : "electron") || x.mode === "all" );
    }

    /**
     * Add a environment object/variable
     *
     * @param name The name of object
     * @param object The object
     * @param mode The mode/environment
     */
    public static setEnvironmentVariable(name: string, object: any, mode: "all" | "daemon" | "electron"): void
    {
        this.environment.push({name: name, object: object, mode: mode});
    }

    /**
     * Returns a Object from the environment
     * @param name The name of object thats returns
     *
     * @returns a object
     */
    public static getObject(name: string): any
    {
        return this.getEnvironment().find(x => x.name === name).object;
    }

    /**
     * Set if running in daemon mode
     * @param daemonMode Set daemon mode is running
     */
    public static setDaemonMode(daemonMode: boolean): void
    {
        this.daemonMode = daemonMode;
    }
}
