'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export type WorkspaceType = 'solo' | 'company'

export async function createOrganization(
	workspaceType: WorkspaceType,
	workspaceName: string
) {
	const { userId } = await auth()

	if (!userId) {
		return { error: 'Unauthorized' }
	}

	try {
		const client = await clerkClient()

		const organization = await client.organizations.createOrganization({
			name: workspaceName,
			createdBy: userId,
			publicMetadata: {
				workspaceType,
				maxMembers: workspaceType === 'solo' ? 5 : -1,
			},
		})

		return { success: true, organizationId: organization.id }
	} catch (err: unknown) {
		console.error('Error creating organization:', err)
		return {
			error: err instanceof Error ? err.message : 'Failed to create workspace',
		}
	}
}
