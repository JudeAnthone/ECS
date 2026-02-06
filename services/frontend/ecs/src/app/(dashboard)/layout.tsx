import React from "react"

export default function Layout ({
    children,
}: {
    children: React.ReactNode
}) {
    return(
        /*
        ! Make sure that there's no leakage here in the backend 
        ! Make sure that the role schemas is purely tight to the convention 
        ! Make sure that the role schemas can be easily change (Suggestion: Make a configuration)
        * Renders overall server side structure for the dashboard onwards
        */
        <>
            {children}
        </>
    )
}