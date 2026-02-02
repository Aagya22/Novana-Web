"use client";
import { useState } from "react";

export default function UpdateForm(
    { user } : { user : any } // any can be replaced with interface/types
) {
    return (
        <div>
            { user.lastName }
            { user.email }
        </div>
    );
}