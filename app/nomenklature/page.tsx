'use server'

import NomenklatureComponent from "@components/NomenklatureComponent"
import Summary from "@models/summary"
import { cookies } from "@node_modules/next/headers"
import { redirect } from "@node_modules/next/navigation"
import connectToDB from "@utils/database"

async function getServerSideProps() {
  'use server'

  try {
      console.log('LOAD LAYOUT EXCEL NAMES')
      await connectToDB()

      const cookieStore = await cookies()
      const token = cookieStore.get("token")
      //console.log({token})
      if (!token || !token.value) {
        throw({error: 'not token'})
      }

      let summarries = await Summary.aggregate([
        {
          $match: {  }
        },
        {
          $group: {
            _id: "$name1C",
            combinedPP: { $push: "$purchasePrice" },
            combinedSP: { $push: "$salePrice" },
            combinedCounts: { $push: "$counts" },
          }
        },
        {
          $project: {
            combinedPP: { $reduce: {
              input: "$combinedPP",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }},
            combinedSP: { $reduce: {
                input: "$combinedSP",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
            }},
            combinedCounts: { $reduce: {
                input: "$combinedCounts",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
            }}
          }
        }
      ])

      summarries = JSON.parse(JSON.stringify(summarries))

      //console.log({summarries: JSON.stringify(summarries)})

      return {summarries}

    } catch (error) {
        console.log('LOAD LAYOUT GSSP', error)
        redirect(error == 'not user' || error == 'not auth' ? '/signin' : '/404')
    }
}

export default async function Page() {

  const props = await getServerSideProps()

  return (
    <NomenklatureComponent summarries={props.summarries}></NomenklatureComponent>
  );
}