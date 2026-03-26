'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type EntityType,
} from '@/lib/validators/document'
import type { DocumentRecord } from './actions'
import { updateDocument } from './actions'

type Props = {
  document: DocumentRecord
  onSaved: () => void
  onCancel: () => void
}

export function DocumentEditDialog({
  document: doc,
  onSaved,
  onCancel,
}: Props) {
  const [category, setCategory] = useState<DocumentCategory>(
    (doc.documentType as DocumentCategory) ?? 'other',
  )
  const [entityType, setEntityType] = useState<EntityType | ''>(
    (doc.entityType as EntityType) ?? '',
  )
  const [entityId, setEntityId] = useState(doc.entityId ?? '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    setSaving(true)

    const result = await updateDocument(doc.id, {
      category,
      entityType: entityType || null,
      entityId: entityId || null,
    })

    setSaving(false)

    if (result.error) {
      toast({
        title: 'Update failed',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    toast({ title: 'Document updated' })
    onSaved()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-category">Category</Label>
        <select
          id="edit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-entity-type">Link to entity (optional)</Label>
        <select
          id="edit-entity-type"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as EntityType | '')
            if (!e.target.value) setEntityId('')
          }}
          className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <option value="">None</option>
          <option value="flight">Flight</option>
          <option value="aircraft">Aircraft</option>
          <option value="training">Training</option>
        </select>
      </div>

      {entityType && (
        <div className="space-y-2">
          <Label htmlFor="edit-entity-id">Entity ID</Label>
          <Input
            id="edit-entity-id"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Paste the entity UUID"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  )
}
