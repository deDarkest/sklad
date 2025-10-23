'use client'

import { NextUIProvider } from '@nextui-org/react'

export default function NextUIProviderTemp({
    children
}: {
    children: React.ReactNode
}) {

    return (
        <NextUIProvider className='w-full dark h-full'>
            {children}
        </NextUIProvider>
    )
}