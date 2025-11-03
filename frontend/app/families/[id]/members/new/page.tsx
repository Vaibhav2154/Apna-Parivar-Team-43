'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context-new';
import { ProtectedRoute } from '@/lib/protected-route';
import { createFamilyMember, updateFamilyMember, getFamilyMember } from '@/lib/family-service';
import { FamilyMember } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberFormPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.id as string;
  const memberId = (params.memberId as string) || null;
  const isEdit = !!memberId;

  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    relationships: {} as Record<string, string>,
    custom_fields: {} as Record<string, string>,
  });

  const [relationshipFields, setRelationshipFields] = useState<{ key: string; value: string }[]>([
    { key: 'father', value: '' },
    { key: 'mother', value: '' },
    { key: 'spouse', value: '' },
  ]);

  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && memberId) {
      loadMember();
    }
  }, [familyId, memberId, isEdit]);

  const loadMember = async () => {
    try {
      setIsLoading(true);
      const member = await getFamilyMember(familyId, memberId as string);
      setFormData({
        name: member.name,
        photo_url: member.photo_url || '',
        relationships: member.relationships,
        custom_fields: member.custom_fields,
      });

      // Populate relationship fields
      const relFields = Object.entries(member.relationships).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      if (relFields.length === 0) {
        relFields.push({ key: 'father', value: '' }, { key: 'mother', value: '' }, { key: 'spouse', value: '' });
      }
      setRelationshipFields(relFields);

      // Populate custom fields
      const custFields = Object.entries(member.custom_fields).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setCustomFields(custFields.length > 0 ? custFields : [{ key: '', value: '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Build relationships object
      const relationships: Record<string, string> = {};
      relationshipFields.forEach(({ key, value }) => {
        if (key && value) {
          relationships[key] = value;
        }
      });

      // Build custom fields object
      const customFieldsObj: Record<string, string> = {};
      customFields.forEach(({ key, value }) => {
        if (key && value) {
          customFieldsObj[key] = value;
        }
      });

      if (isEdit && memberId) {
        await updateFamilyMember(familyId, memberId as string, {
          name: formData.name,
          photo_url: formData.photo_url,
          relationships,
          custom_fields: customFieldsObj,
        } as Partial<FamilyMember>);
      } else {
        await createFamilyMember(
          familyId,
          formData.name,
          formData.photo_url,
          relationships,
          customFieldsObj
        );
      }

      router.push(`/families/${familyId}/members`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={['family_admin', 'family_co_admin']}>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['family_admin', 'family_co_admin']}>
      <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/families/${familyId}/members`} className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2 transition">
              ← Back to Members
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">{isEdit ? 'Edit Member' : 'Add New Member'}</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl shadow-white/5 p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Photo URL</label>
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                    />
                    {formData.photo_url && (
                      <div className="mt-4">
                        <img src={formData.photo_url} alt={formData.name} className="h-32 w-32 object-cover rounded-lg border border-white/20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Relationships */}
              <div className="border-t border-white/10 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Relationships</h2>
                <div className="space-y-3">
                  {relationshipFields.map((field, index) => (
                    <div key={index} className="flex gap-3 flex-col sm:flex-row">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...relationshipFields];
                          newFields[index].key = e.target.value;
                          setRelationshipFields(newFields);
                        }}
                        placeholder="e.g., father, mother, spouse"
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...relationshipFields];
                          newFields[index].value = e.target.value;
                          setRelationshipFields(newFields);
                        }}
                        placeholder="Name of related person"
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setRelationshipFields(relationshipFields.filter((_, i) => i !== index))}
                        className="px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRelationshipFields([...relationshipFields, { key: '', value: '' }])}
                    className="text-white/60 hover:text-white text-sm font-medium mt-3 transition"
                  >
                    + Add Relationship
                  </button>
                </div>
              </div>

              {/* Custom Fields */}
              <div className="border-t border-white/10 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Additional Information</h2>
                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <div key={index} className="flex gap-3 flex-col sm:flex-row">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...customFields];
                          newFields[index].key = e.target.value;
                          setCustomFields(newFields);
                        }}
                        placeholder="Field name"
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...customFields];
                          newFields[index].value = e.target.value;
                          setCustomFields(newFields);
                        }}
                        placeholder="Field value"
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                        className="px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                    className="text-white/60 hover:text-white text-sm font-medium mt-3 transition"
                  >
                    + Add Field
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-white/10 flex-col sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-white text-[#010104] font-medium rounded-lg hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
                </button>
                <Link
                  href={`/families/${familyId}/members`}
                  className="px-6 py-2.5 bg-white/10 border border-white/20 text-foreground text-center font-medium rounded-lg hover:border-white/40 transition-all duration-300"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
