'use server'

import UnboxComponent from "@components/UnboxComponent"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


async function getServerSideProps(stringForQR: any) {
    'use server'
  
    try {

        revalidateTag('stringforqr')
        console.log({ stringForQR })

        let response4 = await fetch(`${process.env.NEXTAUTH_URL}/api/unbox?stringForQR=${JSON.stringify(JSON.parse(stringForQR))}`, { next: { tags: ['stringforqr'] } })
        let order = await response4.json()
        order = JSON.parse(JSON.stringify(order))
        

        return {rows: order.rows, order: order.order}
    } catch (error) {
        console.log('LOAD LAYOUT GSSP', error)
        redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
    }
}

export default async function Page(ctx: any) {

    const props = await getServerSideProps(ctx.searchParams.stringForQR)
  
    return (
      <UnboxComponent rows={props.rows} order={props.order}></UnboxComponent>
    )
  }