/** Contains information to a connected resource. */
export interface ResourceLink {
    /** The relation of the link */
    rel: string;
    /** The url to the connected resource. */
    href: string
}

/** Contains information to an action which can be executed on the resource. */
export interface ResourceAction {
    /** The relation of the action */
    rel: string;
    /** The HTTP verb to use for this action. */
    method: 'PUT' | 'POST' | 'DELETE'
    /** The url where to send the resources to. */
    href: string
}

/** Contains information to a related socket. */
export interface ResourceSocket {
    /** The relation of the socket */
    rel: string;
    /** The name of the event the socket sends out. */
    event: string
    /** The url to the socket. */
    href: string
}

export type Resource = Record<string, unknown>;

export type DynamicResourceValue = DynamicResource | Resource | number | string | boolean | DynamicResource[] | Resource[] | number[] | boolean[] | null;

export type DynamicResource = Resource & {
    [key: string]: DynamicResource | number | string | boolean | DynamicResource[] | number[] | boolean[] | null;
}

export const initialDynamicResource: DynamicResource = {};
