'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export type IntegrationName =
	| 'gmail'
	| 'slack'
	| 'linear'
	| 'github'
	| 'cursor'
	| 'mcp'

export interface IntegrationEntry {
	connected: boolean
	connectedAt?: string
	connectedBy?: string
}

export type IntegrationsMetadata = Partial<
	Record<IntegrationName, IntegrationEntry>
>

export interface OrgPublicMetadata {
	workspaceType?: 'solo' | 'company'
	maxMembers?: number
	integrations?: IntegrationsMetadata
}

export async function toggleIntegration(
	integrationName: IntegrationName,
	connect: boolean
) {
	const { userId, orgId } = await auth()

	if (!userId || !orgId) {
		return { error: 'Unauthorized' }
	}

	try {
		const client = await clerkClient()
		const org = await client.organizations.getOrganization({
			organizationId: orgId,
		})

		const currentMetadata = (org.publicMetadata ?? {}) as OrgPublicMetadata
		const currentIntegrations = currentMetadata.integrations ?? {}

		const updatedIntegrations: IntegrationsMetadata = {
			...currentIntegrations,
			[integrationName]: connect
				? {
						connected: true,
						connectedAt: new Date().toISOString(),
						connectedBy: userId,
					}
				: { connected: false },
		}

		await client.organizations.updateOrganizationMetadata(orgId, {
			publicMetadata: {
				...currentMetadata,
				integrations: updatedIntegrations,
			},
		})

		return { success: true }
	} catch (err: unknown) {
		console.error('Error toggling integration:', err)
		return {
			error:
				err instanceof Error ? err.message : 'Failed to update integration',
		}
	}
}
