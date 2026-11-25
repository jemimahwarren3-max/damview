'use client'

import { useRouter } from 'next/navigation'
import CreateAdminForm from './CreateAdminForm'

export default function CreateAdminFormWrapper() {
 const router = useRouter()

 return <CreateAdminForm onCreated={() => router.refresh()} />
}
