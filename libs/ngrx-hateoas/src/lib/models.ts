/** Contains information to a connected resource. */
export interface ResourceLink {
    /** The url to the connected resource. */
    href: string
}

/** Contains information to an action which can be executed on the resource. */
export interface ResourceAction {
    /** The HTTP verb to use for this action. */
    method: 'PUT' | 'POST' | 'DELETE'
    /** The url where to send the resources to. */
    href: string
}

/** Contains information to a related socket. */
export interface ResourceSocket {
    /** The name of the method the socket sends out. */
    method: string
    /** The url to the socket. */
    href: string
}

export type Resource = {
}

export type DynamicResourceValue = DynamicResource | Resource | number | string | boolean | DynamicResource[] | Resource[] | number[] | boolean[] | null;

export type DynamicResource = Resource & {
    [key: string]: DynamicResourceValue;
}

export const initialDynamicResource: DynamicResource = {};
