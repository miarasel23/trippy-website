'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePolicySupport } from '@/hooks/usePolicySupport';
import {
  ShieldCheck,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface PolicyTermsViewProps {
  initialTab?: 'privacy' | 'terms' | 'trip_policy' | 'support';
}

export const PolicyTermsView: React.FC<PolicyTermsViewProps> = ({
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'trip_policy' | 'support'>(
    initialTab
  );

  const {
    support,
    hotlinePhone,
    hotlineDisplay,
    emergencyNumber,
    emergencyDisplay,
    policyData,
    loading,
    refetch,
    isBn,
  } = usePolicySupport();

  const privacyItem = policyData?.PRIVACY_POLICY?.[0];
  const termsItem = policyData?.TERMS_CONDITION?.[0];
  const tripPolicyItem = policyData?.TRIP_POLICY?.[0];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            {isBn ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">
            {isBn ? 'নীতিমালা ও শর্তাবলী' : 'Legal & Support'}
          </span>
        </div>

        {/* Page Title Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {isBn ? 'অফিসিয়াল নীতিমালা' : 'Official Policy & Compliance'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {isBn
                  ? 'গোপনীয়তা, শর্তাবলী এবং সহায়তা'
                  : 'Privacy Policy, Terms & Help Support'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isBn
                  ? 'ট্রিপির সাথে আপনার নিরাপত্তা, অধিকার ও সেবার সম্পূর্ণ নিয়মাবলী।'
                  : 'Your rights, data security, transparent ride rules, and 24/7 dedicated assistance.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={loading}
              className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-2 text-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Support Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Hotline Card */}
          <a
            href={`tel:${hotlinePhone}`}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-emerald-300 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                {isBn ? '২৪/৭ গ্রাহক সহায়তা' : '24/7 Customer Hotline'}
              </span>
              <strong className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors font-mono">
                {hotlineDisplay}
              </strong>
            </div>
          </a>

          {/* Emergency SOS Card */}
          <a
            href={`tel:${emergencyNumber}`}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-red-300 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                {isBn ? 'জরুরি সহায়তা (পুলিশ)' : 'National Emergency (Police)'}
              </span>
              <strong className="text-sm font-extrabold text-red-600 group-hover:text-red-700 transition-colors font-mono">
                {emergencyDisplay}
              </strong>
            </div>
          </a>

          {/* Email Support Card */}
          <a
            href={`mailto:${support.email}`}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5 hover:border-blue-300 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                {isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}
              </span>
              <strong className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                {support.email}
              </strong>
            </div>
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'গোপনীয়তা নীতিমালা' : 'Privacy Policy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trip_policy')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'trip_policy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isBn ? 'ট্রিপ নীতিমালা' : 'Trip Policy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'support'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isBn ? 'সাহায্য ও যোগাযোগ' : 'Help & Support'}</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500">
                {isBn ? 'নীতিমালা লোড হচ্ছে...' : 'Loading official terms and policy...'}
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: Privacy Policy */}
              {activeTab === 'privacy' && (
                <div>
                  {privacyItem?.content ? (
                    <div
                      className="prose prose-slate max-w-none prose-h1:text-2xl prose-h1:font-black prose-h1:font-heading prose-h2:text-lg prose-h2:font-extrabold prose-h2:text-slate-900 prose-p:text-slate-600 prose-p:text-sm prose-li:text-sm prose-li:text-slate-600"
                      dangerouslySetInnerHTML={{ __html: privacyItem.content }}
                    />
                  ) : (
                    <p className="text-sm text-slate-500 py-8 text-center">
                      {isBn
                        ? 'গোপনীয়তা নীতিমালা শীঘ্রই প্রকাশ করা হবে।'
                        : 'Privacy policy details will be available shortly.'}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: Terms & Conditions */}
              {activeTab === 'terms' && (
                <div>
                  {termsItem?.content ? (
                    <div
                      className="prose prose-slate max-w-none prose-h1:text-2xl prose-h1:font-black prose-h1:font-heading prose-h2:text-lg prose-h2:font-extrabold prose-h2:text-slate-900 prose-p:text-slate-600 prose-p:text-sm prose-li:text-sm prose-li:text-slate-600"
                      dangerouslySetInnerHTML={{ __html: termsItem.content }}
                    />
                  ) : (
                    <p className="text-sm text-slate-500 py-8 text-center">
                      {isBn
                        ? 'ব্যবহারের শর্তাবলী শীঘ্রই প্রকাশ করা হবে।'
                        : 'Terms and conditions will be available shortly.'}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: Trip Policy */}
              {activeTab === 'trip_policy' && (
                <div>
                  {tripPolicyItem?.content ? (
                    <div
                      className="prose prose-slate max-w-none prose-h1:text-2xl prose-h1:font-black prose-h1:font-heading prose-h2:text-lg prose-h2:font-extrabold prose-h2:text-slate-900 prose-p:text-slate-600 prose-p:text-sm prose-li:text-sm prose-li:text-slate-600"
                      dangerouslySetInnerHTML={{ __html: tripPolicyItem.content }}
                    />
                  ) : (
                    <p className="text-sm text-slate-500 py-8 text-center">
                      {isBn
                        ? 'ট্রিপ নীতিমালা শীঘ্রই প্রকাশ করা হবে।'
                        : 'Trip policy will be available shortly.'}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 4: Help & Support */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-heading mb-2">
                      {isBn ? 'গ্রাহক সেবা ও তাৎক্ষণিক সহায়তা' : 'Customer Care & Immediate Assistance'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn
                        ? 'যেকোনো জিজ্ঞাসা, অভিযোগ বা সহযোগিতার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।'
                        : 'Reach out to our support team anytime for ride queries, billing issues, or safety assistance.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {isBn ? '২৪/৭ গ্রাহক হটলাইন' : '24/7 Dedicated Hotline'}
                        </span>
                      </div>
                      <a
                        href={`tel:${hotlinePhone}`}
                        className="text-lg font-black text-emerald-700 hover:text-emerald-800 transition-colors font-mono block"
                      >
                        {hotlineDisplay}
                      </a>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn
                          ? 'যেকোনো সময় সরাসরি আমাদের গ্রাহক প্রতিনিধি দলের সাথে কথা বলুন।'
                          : 'Speak directly with our passenger support team round the clock.'}
                      </p>
                    </div>

                    <div className="border border-red-200 rounded-2xl p-5 bg-red-50/30">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                          {isBn ? 'জাতীয় জরুরি সেবা' : 'National Emergency Response'}
                        </span>
                      </div>
                      <a
                        href={`tel:${emergencyNumber}`}
                        className="text-lg font-black text-red-600 hover:text-red-700 transition-colors font-mono block"
                      >
                        {emergencyDisplay}
                      </a>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isBn
                          ? 'পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্সের জন্য জরুরি সেবা।'
                          : 'Immediate connection to National Police, Fire Service, and Ambulance.'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {isBn ? 'অফিসিয়াল সাপোর্ট ইমেইল' : 'Official Support Email'}
                      </span>
                    </div>
                    <a
                      href={`mailto:${support.email}`}
                      className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors block"
                    >
                      {support.email}
                    </a>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isBn
                        ? 'আপনার মতামত, রসিদ বা ফিডব্যাক ইমেইলের মাধ্যমে পাঠাতে পারেন।'
                        : 'Send detailed feedback, lost and found inquiries, or business requests.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
