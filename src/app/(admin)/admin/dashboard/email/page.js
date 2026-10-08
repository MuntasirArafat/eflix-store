'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bell,
  Bold,
  ChevronDown,
  Code,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Mail,
  Paperclip,
  Quote,
  Send,
  Strikethrough,
  Underline,
  X,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';


import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

const sendOptions = [
  {
    name: 'Email',
    icon: Mail,
  },
  {
    name: 'OneSignal',
    icon: Bell,
  },
];

const recipientOptions = [
  'All Subscribers',
  'Specific Email',
  'Multiple Emails',
];

export default function SendNotificationPage() {
  const [sendType, setSendType] = useState('Email');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Email recipient
  const [recipientType, setRecipientType] =
    useState('All Subscribers');
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] =
    useState(false);

  const [recipientEmail, setRecipientEmail] = useState('');
  const [multipleEmails, setMultipleEmails] = useState('');

  // Email
  const [emailSubject, setEmailSubject] = useState('');

  // OneSignal
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');

  const [isSending, setIsSending] = useState(false);


  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[350px] px-4 py-4 focus:outline-none text-sm text-[#e5e5e5]',
      },
    },
  });

  const handleImage = () => {
    if (!editor) return;

    const url = window.prompt('Enter image URL');

    if (!url) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: url,
      })
      .run();
  };

  const handleLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;

    const url = window.prompt(
      'Enter URL',
      previousUrl || 'https://'
    );

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
      })
      .run();
  };
 

  const getRecipients = () => {
    if (recipientType === 'All Subscribers') {
      return {
        type: 'all_subscribers',
        emails: [],
      };
    }

    if (recipientType === 'Specific Email') {
      return {
        type: 'specific',
        emails: recipientEmail
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean),
      };
    }

    return {
      type: 'multiple',
      emails: multipleEmails
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean),
    };
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject.');
      return;
    }

    if (!editor || editor.isEmpty) {
      toast.error('Please enter your email message.');
      return;
    }

    const recipients = getRecipients();

    if (
      recipients.type !== 'all_subscribers' &&
      recipients.emails.length === 0
    ) {
      toast.error('Please enter at least one email address.');
      return;
    }

    const invalidEmails = recipients.emails.filter(
      (email) => !isValidEmail(email)
    );

    if (invalidEmails.length > 0) {
      toast.error(
        `Invalid email address:\n${invalidEmails.join(', ')}`
      );
      return;
    }

    setIsSending(true);

    try {
      const payload = {
        type: 'email',
        recipientType: recipients.type,
        recipients: recipients.emails,
        subject: emailSubject,
        html: editor.getHTML(),
      };

      const res = await axios.post('/api/admin/email', payload);

      if (res.data.success) {
        toast.success(res.data.message || 'Email sent successfully.');
        setEmailSubject('');
        editor.commands.clearContent();
        setRecipientEmail('');
        setMultipleEmails('');
        setRecipientType('All Subscribers');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim()) {
      toast.error('Please enter a notification title.');
      return;
    }

    if (!notificationMessage.trim()) {
      toast.error('Please enter a notification message.');
      return;
    }

    setIsSending(true);

    try {
      const payload = {
        type: 'onesignal',
        recipientType: 'all_subscribers',
        title: notificationTitle,
        message: notificationMessage,
        url: notificationUrl,
      };

      const res = await axios.post('/api/admin/email', payload);

      if (res.data.success) {
        toast.success(res.data.message || 'Notification sent successfully.');
        setNotificationTitle('');
        setNotificationMessage('');
        setNotificationUrl('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className='pb-8 relative w-full'>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              Send Notification
            </h1>

            <p className="text-[#a3a3a3] text-xs sm:text-sm">
              Send an email or push notification to all subscribed
              users.
            </p>
          </div>

          {/* Send Type Switcher */}
          <div className="relative w-fit">
            <button
              type="button"
              onClick={() =>
                setIsTypeDropdownOpen(
                  !isTypeDropdownOpen
                )
              }
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              {sendType === 'Email' ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}

              <span>{sendType}</span>

              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isTypeDropdownOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-11 right-0 bg-white rounded-xl shadow-lg py-2 w-40 z-30">
                {sendOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => {
                        setSendType(option.name);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        sendType === option.name
                          ? 'bg-gray-100 text-black'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />

                      {option.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#353638] my-6 sm:my-8" />

      {/* EMAIL */}
      {sendType === 'Email' && (
        <div>
          {/* Recipient */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Send To
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Recipient Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setIsRecipientDropdownOpen(
                      !isRecipientDropdownOpen
                    )
                  }
                  className="w-full sm:w-auto min-w-[190px] flex items-center justify-between gap-3 bg-[#353638] border border-[#444444] rounded-full px-4 py-2.5 text-sm text-[#e5e5e5] hover:bg-[#3b3c3e] transition-colors"
                >
                  <span>{recipientType}</span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isRecipientDropdownOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />
                </button>

                {isRecipientDropdownOpen && (
                  <div className="absolute top-12 left-0 bg-[#353638] border border-[#444444] rounded-xl shadow-lg py-2 w-full sm:w-[210px] z-30">
                    {recipientOptions.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setRecipientType(option);
                            setIsRecipientDropdownOpen(
                              false
                            );

                            if (
                              option ===
                              'All Subscribers'
                            ) {
                              setRecipientEmail('');
                              setMultipleEmails('');
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            recipientType === option
                              ? 'bg-[#444444] text-white'
                              : 'text-[#e5e5e5] hover:bg-[#3d3e40]'
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Specific Email */}
              {recipientType ===
                'Specific Email' && (
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) =>
                    setRecipientEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className="flex-1 bg-[#2f3032] border border-[#444444] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666]"
                />
              )}

              {/* Multiple Emails */}
              {recipientType ===
                'Multiple Emails' && (
                <input
                  type="text"
                  value={multipleEmails}
                  onChange={(e) =>
                    setMultipleEmails(
                      e.target.value
                    )
                  }
                  placeholder="email1@example.com, email2@example.com"
                  className="flex-1 bg-[#2f3032] border border-[#444444] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666]"
                />
              )}
            </div>

            <p className="text-[#777777] text-xs mt-2">
              {recipientType ===
                'All Subscribers' &&
                'The email will be sent to all subscribed users.'}

              {recipientType ===
                'Specific Email' &&
                'Enter the email address of the person you want to contact.'}

              {recipientType ===
                'Multiple Emails' &&
                'Separate multiple email addresses with commas.'}
            </p>
          </div>

          {/* Subject */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Subject
            </label>

            <input
              type="text"
              value={emailSubject}
              onChange={(e) =>
                setEmailSubject(e.target.value)
              }
              placeholder="Enter email subject"
              className="w-full bg-[#2f3032] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666]"
            />
          </div>

          {/* Message Editor */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Message
            </label>

            <div className="bg-[#2f3032] border border-[#444444] rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#444444]">
                {/* Bold */}
                <button
                  type="button"
                  title="Bold"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleBold()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('bold')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  title="Italic"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleItalic()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('italic')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  title="Underline"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleUnderline()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('underline')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </button>

                {/* Strike */}
                <button
                  type="button"
                  title="Strikethrough"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleStrike()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('strike')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[#444444] mx-1" />

                {/* Bullet List */}
                <button
                  type="button"
                  title="Bullet List"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleBulletList()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('bulletList')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>

                {/* Ordered List */}
                <button
                  type="button"
                  title="Numbered List"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleOrderedList()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('orderedList')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[#444444] mx-1" />

                {/* Align Left */}
                <button
                  type="button"
                  title="Align Left"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .setTextAlign('left')
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive({
                      textAlign: 'left',
                    })
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>

                {/* Align Center */}
                <button
                  type="button"
                  title="Align Center"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .setTextAlign('center')
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive({
                      textAlign: 'center',
                    })
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>

                {/* Align Right */}
                <button
                  type="button"
                  title="Align Right"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .setTextAlign('right')
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive({
                      textAlign: 'right',
                    })
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[#444444] mx-1" />

                {/* Link */}
                <button
                  type="button"
                  title="Add Link"
                  onClick={handleLink}
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('link')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                {/* Image */}
                <button
                  type="button"
                  title="Add Image"
                  onClick={handleImage}
                  className="p-2 rounded-lg text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Quote */}
                <button
                  type="button"
                  title="Quote"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleBlockquote()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive(
                      'blockquote'
                    )
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Quote className="w-4 h-4" />
                </button>

                {/* Code */}
                <button
                  type="button"
                  title="Code"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleCode()
                      .run()
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    editor?.isActive('code')
                      ? 'bg-[#444444] text-white'
                      : 'text-[#a3a3a3] hover:bg-[#3b3c3e] hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              {/* Editor */}
              <EditorContent editor={editor} />
            </div>
          </div>

        

          {/* Send */}
          <div className="flex w-full">
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className="flex w-full items-center justify-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending
                ? 'Sending...'
                : 'Send Email'}
            </button>
          </div>
        </div>
      )}

      {/* ONESIGNAL */}
      {sendType === 'OneSignal' && (
        <div>
          {/* Recipient */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Send To
            </label>

            <div className="bg-[#353638] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#a3a3a3]" />

                <div>
                  <p className="text-sm text-[#e5e5e5]">
                    All Subscribers
                  </p>

                  <p className="text-xs text-[#777777] mt-0.5">
                    Send push notification to all subscribed
                    devices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Notification Title
            </label>

            <input
              type="text"
              value={notificationTitle}
              onChange={(e) =>
                setNotificationTitle(
                  e.target.value
                )
              }
              placeholder="Enter notification title"
              maxLength={100}
              className="w-full bg-[#2f3032] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666]"
            />
          </div>

          {/* Message */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#e5e5e5]">
                Message
              </label>

              <span className="text-xs text-[#777777]">
                {notificationMessage.length}/200
              </span>
            </div>

            <textarea
              value={notificationMessage}
              onChange={(e) =>
                setNotificationMessage(
                  e.target.value
                )
              }
              placeholder="Enter notification message"
              maxLength={200}
              rows={6}
              className="w-full bg-[#2f3032] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666] resize-none"
            />
          </div>

          {/* URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#e5e5e5] mb-2">
              Notification URL
              <span className="text-[#777777] font-normal ml-1">
                (Optional)
              </span>
            </label>

            <input
              type="url"
              value={notificationUrl}
              onChange={(e) =>
                setNotificationUrl(
                  e.target.value
                )
              }
              placeholder="https://example.com"
              className="w-full bg-[#2f3032] mb-4 border border-[#444444] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#777777] focus:outline-none focus:border-[#666666]"
            />
          </div>

          {/* Send */}
          <div className="flex w-full ">
            <button
              type="button"
              onClick={handleSendNotification}
              disabled={isSending}
              className="flex items-center w-full  justify-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending
                ? 'Sending...'
                : 'Send Notification'}
            </button>
          </div>
        </div>
      )}

   
    </div>
  );
}