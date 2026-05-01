'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { BlogPost } from '@/app/blog/blogData';
import { cleanBlogSlugText } from '@/lib/blog-seo';

interface BlogEditorProps {
  editingBlog?: BlogPost | null;
  onCancelEdit?: () => void;
}

type DraftPayload = {
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  contentType: 'file' | 'manual';
  manualContent: string;
  manualSEO: boolean;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string;
  imageAlt: string;
  customImageAlt: boolean;
  cardImagePreview?: string;
  coverImagePreview?: string;
  updatedAt: string;
};

type ContentImage = {
  file: File;
  preview: string;
  id: string;
};

const DEFAULT_FORM = {
  title: '',
  slug: '',
  category: '',
  author: 'Building Approvals Dubai',
  excerpt: '',
  cardImage: null as File | null,
  coverImage: null as File | null,
  contentFile: null as File | null,
  contentType: 'manual' as 'file' | 'manual',
  manualContent: '',
  manualSEO: false,
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  keywords: '',
  imageAlt: '',
  customImageAlt: false,
};

const UploadImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploadId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-upload-id'),
        renderHTML: (attributes) => (
          attributes.uploadId ? { 'data-upload-id': attributes.uploadId } : {}
        ),
      },
    };
  },
});

const TextAlign = Extension.create({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph', 'blockquote', 'tableCell', 'tableHeader'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element: HTMLElement) => {
              const dataAlign = element.getAttribute('data-text-align');
              if (dataAlign) return dataAlign;
              const classMatch = (element.getAttribute('class') || '').match(/text-align-(left|center|right)/);
              if (classMatch) return classMatch[1];
              return null;
            },
            renderHTML: (attributes: { textAlign?: string | null }) => {
              if (!attributes.textAlign) return {};
              return {
                class: `text-align-${attributes.textAlign}`,
                'data-text-align': attributes.textAlign,
              };
            },
          },
        },
      },
    ];
  },
});

const TextSize = Mark.create({
  name: 'textSize',

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-size') || null,
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return {
            class: `text-size-${attributes.size}`,
            'data-text-size': attributes.size,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-text-size]' },
      { tag: 'span[class*="text-size-"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const TextColor = Mark.create({
  name: 'textColor',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-text-color') || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            class: `text-color-${attributes.color}`,
            'data-text-color': attributes.color,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-text-color]' },
      { tag: 'span[class*="text-color-"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const ResizableTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-row-height') || null,
        renderHTML: (attributes) => {
          if (!attributes.rowHeight) return {};
          return {
            class: `row-height-${attributes.rowHeight}`,
            'data-row-height': attributes.rowHeight,
          };
        },
      },
    };
  },
});

export default function BlogEditor({ editingBlog, onCancelEdit }: BlogEditorProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [previews, setPreviews] = useState({ cardImage: '', coverImage: '' });
  const [contentImages, setContentImages] = useState<ContentImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showTextSizeMenu, setShowTextSizeMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [draftStatus, setDraftStatus] = useState('Draft');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosaveRef = useRef(false);
  const selectionRef = useRef<{ from: number; to: number } | null>(null);

  const getAuthHeader = (): Record<string, string> => {
    const token = sessionStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const buildAutoKeywords = (title: string) =>
    title
      .split(/\s+/)
      .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
      .filter((word) => word.length > 3)
      .join(', ');

  const getDraftKey = (slug?: string) => `building-approvals-blog-draft:${slug || 'new'}`;

  const clearDraft = (slug?: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(getDraftKey(slug));
  };

  const draftPayload = useMemo<DraftPayload>(() => ({
    title: formData.title,
    slug: formData.slug,
    category: formData.category,
    author: formData.author,
    excerpt: formData.excerpt,
    contentType: formData.contentType,
    manualContent: formData.manualContent,
    manualSEO: formData.manualSEO,
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    focusKeyword: formData.focusKeyword,
    keywords: formData.keywords,
    imageAlt: formData.imageAlt,
    customImageAlt: formData.customImageAlt,
    cardImagePreview: previews.cardImage,
    coverImagePreview: previews.coverImage,
    updatedAt: new Date().toISOString(),
  }), [formData, previews]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        },
      }),
      TextSize,
      TextColor,
      UploadImage,
      TextAlign,
      Table.configure({
        resizable: true,
        renderWrapper: true,
        allowTableNodeSelection: true,
        cellMinWidth: 120,
      }),
      ResizableTableRow,
      TableHeader,
      TableCell,
    ],
    content: formData.manualContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'ProseMirror blog-wysiwyg visual-editor',
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        addImageToEditor(file);
        return true;
      },
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      const nextSelection = {
        from: nextEditor.state.selection.from,
        to: nextEditor.state.selection.to,
      };
      selectionRef.current = nextSelection;
    },
    onUpdate: ({ editor: nextEditor }) => {
      const nextHtml = nextEditor.getHTML();
      setFormData((prev) => (
        prev.manualContent === nextHtml ? prev : { ...prev, manualContent: nextHtml }
      ));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (formData.manualContent && currentHtml !== formData.manualContent) {
      editor.commands.setContent(formData.manualContent);
    }
    if (!formData.manualContent && currentHtml !== '<p></p>') {
      editor.commands.clearContent(true);
    }
  }, [editor, formData.manualContent]);

  useEffect(() => {
    if (!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  }, [formData.title]);

  const applyDraft = (draft: DraftPayload) => {
    setFormData((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      slug: draft.slug || prev.slug,
      category: draft.category || prev.category,
      author: draft.author || prev.author,
      excerpt: draft.excerpt || prev.excerpt,
      contentType: draft.contentType || prev.contentType,
      manualContent: draft.manualContent || prev.manualContent,
      manualSEO: Boolean(draft.manualSEO),
      metaTitle: draft.metaTitle || '',
      metaDescription: draft.metaDescription || '',
      focusKeyword: draft.focusKeyword || '',
      keywords: draft.keywords || '',
      imageAlt: draft.imageAlt || '',
      customImageAlt: Boolean(draft.customImageAlt),
    }));
    setPreviews((prev) => ({
      cardImage: draft.cardImagePreview || prev.cardImage,
      coverImage: draft.coverImagePreview || prev.coverImage,
    }));
    setDraftStatus('Draft recovered');
    skipNextAutosaveRef.current = true;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadNewDraft = () => {
      const saved = window.localStorage.getItem(getDraftKey());
      if (!saved) {
        setFormData(DEFAULT_FORM);
        setPreviews({ cardImage: '', coverImage: '' });
        setContentImages([]);
        setDraftStatus('Draft');
        return;
      }

      try {
        const draft = JSON.parse(saved) as DraftPayload;
        setFormData({ ...DEFAULT_FORM, ...draft, cardImage: null, coverImage: null, contentFile: null });
        setPreviews({
          cardImage: draft.cardImagePreview || '',
          coverImage: draft.coverImagePreview || '',
        });
        setContentImages([]);
        setDraftStatus('Draft recovered');
        skipNextAutosaveRef.current = true;
      } catch {
        window.localStorage.removeItem(getDraftKey());
        setFormData(DEFAULT_FORM);
        setPreviews({ cardImage: '', coverImage: '' });
        setContentImages([]);
        setDraftStatus('Draft');
      }
    };

    if (!editingBlog) {
      loadNewDraft();
      return;
    }

    setIsLoadingBlog(true);
    setContentImages([]);
    fetch(`/api/admin/blogs/${editingBlog.slug}`, { headers: getAuthHeader() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load blog');
        return data;
      })
      .then((data) => {
        if (!data.blog) return;

        const blog = data.blog;
        const content = extractContentFromComponent(blog.contentFile || '');
        const autoMetaTitle = blog.title || '';
        const autoMetaDescription = blog.excerpt || '';
        const autoKeywords = buildAutoKeywords(blog.title || '');
        const loadedKeywords = Array.isArray(blog.keywords) ? blog.keywords.join(', ') : '';
        const hasCustomSeo =
          Boolean(blog.metaTitle && blog.metaTitle !== autoMetaTitle) ||
          Boolean(blog.metaDescription && blog.metaDescription !== autoMetaDescription) ||
          Boolean(loadedKeywords && loadedKeywords !== autoKeywords);

        setFormData({
          ...DEFAULT_FORM,
          title: blog.title || '',
          slug: blog.slug || '',
          category: blog.category || '',
          author: blog.author || 'Building Approvals Dubai',
          excerpt: blog.excerpt || '',
          contentType: 'manual',
          manualContent: content,
          manualSEO: hasCustomSeo,
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          keywords: loadedKeywords,
          imageAlt: '',
          customImageAlt: false,
        });
        setPreviews({
          cardImage: blog.image || '',
          coverImage: blog.coverImage || '',
        });
        setDraftStatus('Draft');

        const saved = window.localStorage.getItem(getDraftKey(blog.slug));
        if (saved) {
          try {
            applyDraft(JSON.parse(saved) as DraftPayload);
          } catch {
            window.localStorage.removeItem(getDraftKey(blog.slug));
          }
        }
      })
      .catch((error) => {
        console.error('Error loading blog:', error);
      })
      .finally(() => setIsLoadingBlog(false));
  }, [editingBlog]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoadingBlog || isSubmitting) return;

    const hasContent = Boolean(
      formData.title ||
      formData.slug ||
      formData.excerpt ||
      formData.manualContent ||
      formData.metaTitle ||
      formData.metaDescription ||
      formData.keywords ||
      formData.imageAlt ||
      previews.cardImage ||
      previews.coverImage
    );

    const draftKey = getDraftKey(editingBlog?.slug || formData.slug || undefined);

    if (!hasContent) {
      window.localStorage.removeItem(draftKey);
      setDraftStatus('Draft');
      return;
    }

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(draftPayload));
      setDraftStatus('Saved locally');
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draftPayload, editingBlog, formData, isLoadingBlog, isSubmitting, previews]);

  useEffect(() => {
    const closeMenus = () => {
      setShowHeadingMenu(false);
      setShowTextSizeMenu(false);
      setShowTextColorMenu(false);
      setShowTableMenu(false);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));

    if (file && (fieldName === 'cardImage' || fieldName === 'coverImage')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title: string) => {
    return cleanBlogSlugText(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const addImageToEditor = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageId = `img_${Date.now()}`;
      const preview = reader.result as string;
      setContentImages((prev) => [...prev, { file, preview, id: imageId }]);
      editor?.chain().focus().insertContent(`<img src="${preview}" alt="${file.name}" data-upload-id="${imageId}" />`).run();
    };
    reader.readAsDataURL(file);
  };

  const handleContentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addImageToEditor(files[0]);
    e.target.value = '';
  };

  const removeContentImage = (id: string) => {
    setContentImages((prev) => prev.filter((img) => img.id !== id));
    if (!editor) return;

    const { state } = editor;
    const { doc, tr } = state;
    let changed = false;

    doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs.uploadId === id) {
        tr.delete(pos, pos + node.nodeSize);
        changed = true;
        return false;
      }
      return true;
    });

    if (changed) editor.view.dispatch(tr);
  };

  const openLinkModal = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const currentSelection = { from, to };
    selectionRef.current = currentSelection;
    setLinkText(editor.state.doc.textBetween(from, to, ' '));
    setLinkUrl(editor.getAttributes('link').href || '');
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!editor) return;

    const rawUrl = linkUrl.trim();
    const normalizedUrl = rawUrl.startsWith('/') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;
    const text = linkText.trim() || normalizedUrl || 'link';

    if (!normalizedUrl) {
      setShowLinkModal(false);
      return;
    }

    if (selectionRef.current) {
      editor.commands.setTextSelection(selectionRef.current);
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      editor.chain().focus().insertContent(`<a href="${normalizedUrl}">${text}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run();
    }

    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  const insertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
    setTableHover({ rows: 0, cols: 0 });
  };

  const handleToolbarMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (editor) {
      selectionRef.current = {
        from: editor.state.selection.from,
        to: editor.state.selection.to,
      };
    }
    e.preventDefault();
  };

  const runEditorCommand = (command: () => void) => {
    if (!editor) return;
    if (selectionRef.current) {
      editor.commands.setTextSelection(selectionRef.current);
    }
    command();
  };

  const applyTextSize = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    if (!editor) return;

    const { state, view } = editor;
    const activeSelection = selectionRef.current ?? {
      from: state.selection.from,
      to: state.selection.to,
    };

    const from = Math.min(activeSelection.from, activeSelection.to);
    const to = Math.max(activeSelection.from, activeSelection.to);

    if (from === to) {
      setShowTextSizeMenu(false);
      return;
    }

    const markType = state.schema.marks.textSize;
    if (!markType) {
      setShowTextSizeMenu(false);
      return;
    }

    let tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));
    tr = tr.removeMark(from, to, markType);

    if (size !== 'base') {
      tr = tr.addMark(from, to, markType.create({ size }));
    }

    view.dispatch(tr);
    editor.commands.focus();
    selectionRef.current = { from, to };
    setShowTextSizeMenu(false);
  };

  const applyTextColor = (color: 'default' | 'slate' | 'navy' | 'teal' | 'emerald' | 'amber' | 'rose' | 'white') => {
    if (!editor) return;

    const { state, view } = editor;
    const activeSelection = selectionRef.current ?? {
      from: state.selection.from,
      to: state.selection.to,
    };

    const from = Math.min(activeSelection.from, activeSelection.to);
    const to = Math.max(activeSelection.from, activeSelection.to);

    if (from === to) {
      setShowTextColorMenu(false);
      return;
    }

    const markType = state.schema.marks.textColor;
    if (!markType) {
      setShowTextColorMenu(false);
      return;
    }

    let tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));
    tr = tr.removeMark(from, to, markType);

    if (color !== 'default') {
      tr = tr.addMark(from, to, markType.create({ color }));
    }

    view.dispatch(tr);
    editor.commands.focus();
    selectionRef.current = { from, to };
    setShowTextColorMenu(false);
  };

  const applyHeadingFormat = (type: 'paragraph' | 1 | 2 | 3) => {
    runEditorCommand(() => {
      if (type === 'paragraph') {
        editor?.chain().focus().setParagraph().run();
      } else {
        editor?.chain().focus().toggleHeading({ level: type }).run();
      }
    });
    setShowHeadingMenu(false);
  };

  const applyTextAlign = (alignment: 'left' | 'center' | 'right') => {
    runEditorCommand(() => {
      editor?.chain().focus()
        .updateAttributes('paragraph', { textAlign: alignment })
        .updateAttributes('heading', { textAlign: alignment })
        .updateAttributes('blockquote', { textAlign: alignment })
        .updateAttributes('tableCell', { textAlign: alignment })
        .updateAttributes('tableHeader', { textAlign: alignment })
        .run();
    });
  };

  const moveSelectedTable = (direction: 'up' | 'down') => {
    if (!editor) return;

    const { state, view } = editor;
    const entries: Array<{ node: typeof state.doc.firstChild; pos: number; index: number }> = [];

    state.doc.forEach((node, pos, index) => {
      entries.push({ node, pos, index });
    });

    const currentIndex = entries.findIndex(({ node, pos }) =>
      node?.type.name === 'table' &&
      state.selection.from >= pos &&
      state.selection.to <= pos + node.nodeSize
    );

    if (currentIndex === -1) return;

    const current = entries[currentIndex];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;

    const target = entries[targetIndex];
    if (!current.node || !target.node) return;

    let newPos = current.pos;
    let tr = state.tr;

    if (direction === 'up') {
      tr = tr.delete(current.pos, current.pos + current.node.nodeSize);
      tr = tr.insert(target.pos, current.node);
      newPos = target.pos;
    } else {
      const insertPos = target.pos + target.node.nodeSize - current.node.nodeSize;
      tr = tr.delete(current.pos, current.pos + current.node.nodeSize);
      tr = tr.insert(insertPos, current.node);
      newPos = insertPos;
    }

    tr = tr.setSelection(NodeSelection.create(tr.doc, newPos));
    view.dispatch(tr);
    editor.commands.focus();
  };

  const applyRowHeight = (height: 'compact' | 'normal' | 'tall') => {
    runEditorCommand(() => {
      editor?.chain().focus().updateAttributes('tableRow', {
        rowHeight: height === 'normal' ? null : height,
      }).run();
    });
  };

  const updateTableStructure = (
    action:
      | 'addRowBefore'
      | 'addRowAfter'
      | 'addColumnBefore'
      | 'addColumnAfter'
      | 'deleteRow'
      | 'deleteColumn'
      | 'deleteTable'
  ) => {
    runEditorCommand(() => {
      const chain = editor?.chain().focus();
      if (!chain) return;

      switch (action) {
        case 'addRowBefore':
          chain.addRowBefore().run();
          break;
        case 'addRowAfter':
          chain.addRowAfter().run();
          break;
        case 'addColumnBefore':
          chain.addColumnBefore().run();
          break;
        case 'addColumnAfter':
          chain.addColumnAfter().run();
          break;
        case 'deleteRow':
          chain.deleteRow().run();
          break;
        case 'deleteColumn':
          chain.deleteColumn().run();
          break;
        case 'deleteTable':
          chain.deleteTable().run();
          break;
        default:
          break;
      }
    });
  };

  const buildContentForSave = (): string => {
    if (!editor) return formData.manualContent;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = editor.getHTML();

    wrapper.querySelectorAll('p').forEach((paragraph) => {
      const meaningfulText = Array.from(paragraph.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.replace(/\u00a0/g, ' ').trim() || '')
        .join('');

      if (meaningfulText) return;

      const blockChild = Array.from(paragraph.children).find((child) =>
        ['DIV', 'TABLE', 'UL', 'OL', 'BLOCKQUOTE'].includes(child.tagName)
      );

      if (!blockChild) return;
      paragraph.replaceWith(blockChild);
    });

    const blockNodes = Array.from(wrapper.children);
    for (let i = 0; i < blockNodes.length; i++) {
      const node = blockNodes[i];
      if (!(node instanceof HTMLElement)) continue;
      if (!['P', 'DIV'].includes(node.tagName)) continue;

      const text = node.textContent?.replace(/\u00a0/g, ' ').trim() || '';
      if (!/^(•|·)\s+/.test(text)) continue;

      const list = document.createElement('ul');
      let currentNode: Element | null = node;

      while (currentNode instanceof HTMLElement && ['P', 'DIV'].includes(currentNode.tagName)) {
        const currentText = currentNode.textContent?.replace(/\u00a0/g, ' ').trim() || '';
        if (!/^(•|·)\s+/.test(currentText)) break;

        const item = document.createElement('li');
        item.innerHTML = currentNode.innerHTML.replace(/^\s*(•|·|&bull;)\s*/i, '');
        list.appendChild(item);

        const nextNode: Element | null = currentNode.nextElementSibling;
        currentNode.remove();
        currentNode = nextNode;
      }

      wrapper.insertBefore(list, wrapper.children[i] || null);
    }

    wrapper.querySelectorAll('img[data-upload-id]').forEach((img) => {
      const imageId = img.getAttribute('data-upload-id');
      if (!imageId) return;
      const placeholder = document.createElement('p');
      placeholder.textContent = `[IMAGE: ${imageId}]`;
      img.replaceWith(placeholder);
    });

    wrapper.querySelectorAll('p').forEach((p) => {
      if (!p.textContent?.trim() && p.querySelectorAll('img, br').length === 0) {
        p.remove();
      }
    });

    return wrapper.innerHTML.trim();
  };

  const triggerImageUpload = () => {
    document.getElementById('contentImages')?.click();
  };

  const triggerCoverUpload = () => {
    document.getElementById('coverImage')?.click();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: editingBlog ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      if (editingBlog) {
        data.append('originalSlug', editingBlog.slug);
        data.append('isEditing', 'true');
      }

      const contentToSend = buildContentForSave();
      const effectiveImageAlt = (formData.customImageAlt && formData.imageAlt.trim())
        ? formData.imageAlt.trim()
        : `Building Approvals Dubai ${formData.category ? `${formData.category} - ` : ''}${formData.title}`.trim();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'object') {
          if (key === 'manualContent') {
            data.append(key, contentToSend);
          } else if (key === 'imageAlt') {
            data.append('imageAlt', effectiveImageAlt);
          } else {
            data.append(key, value.toString());
          }
        }
      });

      if (formData.cardImage) data.append('cardImage', formData.cardImage);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      if (formData.contentFile) data.append('contentFile', formData.contentFile);

      if (editingBlog && !formData.cardImage) {
        data.append('existingCardImage', editingBlog.image);
      }
      if (editingBlog && !formData.coverImage && editingBlog.coverImage) {
        data.append('existingCoverImage', editingBlog.coverImage);
      }

      contentImages.forEach((img, index) => {
        data.append(`contentImage_${index}`, img.file);
      });

      const endpoint = editingBlog ? '/api/admin/update-blog' : '/api/admin/create-blog';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeader(),
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.error}`);
        return;
      }

      alert(
        editingBlog
          ? 'Blog post updated successfully! The site should deploy in ~1–2 minutes.'
          : 'Blog post created successfully! The site should deploy in ~1–2 minutes.'
      );

      clearDraft(editingBlog?.slug || formData.slug || undefined);
      clearDraft();
      setFormData(DEFAULT_FORM);
      setPreviews({ cardImage: '', coverImage: '' });
      setContentImages([]);
      setDraftStatus('Draft');
      editor?.commands.clearContent(true);
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="linkedin-editor">
      <form onSubmit={handleSubmit}>
        <div className="editor-header">
          <div className="editor-header-left">
            <span className="editor-brand">Building Approvals Dubai</span>
            <span className="editor-type">Article Editor</span>
          </div>
          <div className="editor-header-right">
            <button
              type="button"
              className="settings-btn"
              onClick={() => setShowSettings((prev) => !prev)}
            >
              Settings
            </button>
            {editingBlog && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="cancel-btn-header"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSubmitting} className="publish-btn">
              {isSubmitting ? 'Saving...' : (editingBlog ? 'Update' : 'Publish')}
            </button>
          </div>
        </div>

        {showLinkModal && (
          <div className="link-modal-overlay" onClick={() => setShowLinkModal(false)}>
            <div className="link-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Insert Link</h3>
              <div className="link-modal-field">
                <label>Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Text to display"
                  autoFocus
                />
              </div>
              <div className="link-modal-field">
                <label>URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com or /contact"
                />
                <span className="link-hint">Use `/page` for internal links and `https://` for external.</span>
              </div>
              <div className="link-modal-actions">
                <button type="button" onClick={() => setShowLinkModal(false)} className="link-cancel-btn">
                  Cancel
                </button>
                <button type="button" onClick={insertLink} className="link-insert-btn">
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="settings-panel">
            <div className="settings-grid">
              <div className="settings-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Interior Fit-Out"
                />
              </div>
              <div className="settings-group">
                <label>Author</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} />
              </div>
              <div className="settings-group">
                <label>URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="blog-url-slug"
                />
              </div>
              <div className="settings-group">
                <label>Card Image</label>
                <input
                  type="file"
                  id="cardImage"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cardImage')}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="upload-btn-small"
                  onClick={() => document.getElementById('cardImage')?.click()}
                >
                  {formData.cardImage ? formData.cardImage.name : 'Choose Card Image'}
                </button>
                {previews.cardImage && (
                  <div className="small-preview">
                    <img src={previews.cardImage} alt="Card preview" />
                  </div>
                )}
              </div>
              <div className="settings-group full-width">
                <label>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Brief description shown on blog cards"
                />
              </div>
              <div className="settings-group">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="manualSEO"
                    checked={formData.manualSEO}
                    onChange={handleInputChange}
                  />
                  Custom SEO Settings
                </label>
              </div>
              {formData.manualSEO && (
                <>
                  <div className="settings-group full-width">
                    <label>Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      placeholder="SEO title for search results"
                    />
                  </div>
                  <div className="settings-group full-width">
                    <label>Meta Description</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={2}
                      placeholder="SEO description for search snippets"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Focus Keyword</label>
                    <input
                      type="text"
                      name="focusKeyword"
                      value={formData.focusKeyword}
                      onChange={handleInputChange}
                      placeholder="Main keyword"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Keywords (comma separated)</label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2"
                    />
                  </div>
                </>
              )}
              <div className="settings-group full-width">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="customImageAlt"
                    checked={formData.customImageAlt}
                    onChange={handleInputChange}
                  />
                  Custom Image ALT Text
                </label>
                {formData.customImageAlt ? (
                  <input
                    type="text"
                    name="imageAlt"
                    value={formData.imageAlt}
                    onChange={handleInputChange}
                    placeholder={`Building Approvals Dubai ${formData.category ? `${formData.category} - ` : ''}${formData.title || 'Blog Title'}`}
                  />
                ) : (
                  <p className="settings-hint">
                    Auto: <em>Building Approvals Dubai {formData.category ? `${formData.category} - ` : ''}{formData.title || 'Blog Title'}</em>
                  </p>
                )}
              </div>
              <div className="settings-group full-width">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={formData.contentType === 'file'}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      contentType: e.target.checked ? 'file' : 'manual',
                    }))}
                  />
                  Upload Document (PDF/DOCX) instead of writing manually
                </label>
                {formData.contentType === 'file' && (
                  <div className="file-upload-inline">
                    <input
                      type="file"
                      id="contentFile"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'contentFile')}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="upload-btn-small"
                      onClick={() => document.getElementById('contentFile')?.click()}
                    >
                      {formData.contentFile ? formData.contentFile.name : 'Choose Content File'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="editor-main">
          <div
            className={`cover-upload-area ${previews.coverImage ? 'has-image' : ''}`}
            onClick={triggerCoverUpload}
          >
            {previews.coverImage ? (
              <div className="cover-preview">
                <img src={previews.coverImage} alt="Cover" />
                <div className="cover-overlay">
                  <span>Click to change cover image</span>
                </div>
              </div>
            ) : (
              <div className="cover-placeholder">
                <div className="cover-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p className="cover-text">Add a cover image to your article</p>
                <button type="button" className="cover-btn">Upload from computer</button>
              </div>
            )}
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage')}
              style={{ display: 'none' }}
            />
          </div>

          <div className="title-area">
            <textarea
              ref={titleRef}
              className="title-input"
              placeholder="Title"
              value={formData.title}
              onChange={handleTitleChange}
              rows={1}
            />
          </div>

          {formData.contentType === 'manual' && (
            <>
              <div className="top-toolbar" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => runEditorCommand(() => editor?.chain().focus().toggleBold().run())}
                  className={`toolbar-btn ${editor?.isActive('bold') ? 'active' : ''}`}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => runEditorCommand(() => editor?.chain().focus().toggleItalic().run())}
                  className={`toolbar-btn ${editor?.isActive('italic') ? 'active' : ''}`}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <div className="toolbar-divider"></div>
                <div className="toolbar-dropdown">
                  <button
                    type="button"
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => {
                      setShowTextSizeMenu(false);
                      setShowTextColorMenu(false);
                      setShowTableMenu(false);
                      setShowHeadingMenu((prev) => !prev);
                    }}
                    className="toolbar-btn toolbar-dropdown-btn"
                    title="Heading"
                  >
                    <span>H</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                  </button>
                  {showHeadingMenu && (
                    <div className="toolbar-dropdown-menu">
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyHeadingFormat('paragraph')}
                        className="dropdown-item heading-p"
                      >
                        <span className="heading-preview-p">P</span>
                        Paragraph
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyHeadingFormat(1)}
                        className="dropdown-item heading-h1"
                      >
                        <span className="heading-preview-h1">H1</span>
                        Heading 1
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyHeadingFormat(2)}
                        className="dropdown-item heading-h2"
                      >
                        <span className="heading-preview-h2">H2</span>
                        Heading 2
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyHeadingFormat(3)}
                        className="dropdown-item heading-h3"
                      >
                        <span className="heading-preview-h3">H3</span>
                        Heading 3
                      </button>
                    </div>
                  )}
                </div>
                <div className="toolbar-dropdown">
                  <button
                    type="button"
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => {
                      setShowHeadingMenu(false);
                      setShowTextColorMenu(false);
                      setShowTableMenu(false);
                      setShowTextSizeMenu((prev) => !prev);
                    }}
                    className="toolbar-btn toolbar-dropdown-btn"
                    title="Text Size"
                  >
                    <span>T</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                  </button>
                  {showTextSizeMenu && (
                    <div className="toolbar-dropdown-menu">
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextSize('base')}
                        className="dropdown-item heading-p"
                      >
                        <span className="heading-preview-p">T</span>
                        Normal
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextSize('sm')}
                        className="dropdown-item heading-h1"
                      >
                        <span className="heading-preview-h1">S</span>
                        Small
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextSize('lg')}
                        className="dropdown-item heading-h2"
                      >
                        <span className="heading-preview-h2">L</span>
                        Large
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextSize('xl')}
                        className="dropdown-item heading-h3"
                      >
                        <span className="heading-preview-h3">XL</span>
                        Extra Large
                      </button>
                    </div>
                  )}
                </div>
                <div className="toolbar-dropdown">
                  <button
                    type="button"
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => {
                      setShowHeadingMenu(false);
                      setShowTextSizeMenu(false);
                      setShowTableMenu(false);
                      setShowTextColorMenu((prev) => !prev);
                    }}
                    className="toolbar-btn toolbar-dropdown-btn"
                    title="Text Color"
                  >
                    <span>C</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                  </button>
                  {showTextColorMenu && (
                    <div className="toolbar-dropdown-menu color-dropdown-menu">
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('default')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-default" />
                        Default
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('slate')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-slate" />
                        Slate
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('navy')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-navy" />
                        Navy
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('teal')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-teal" />
                        Teal
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('emerald')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-emerald" />
                        Emerald
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('amber')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-amber" />
                        Amber
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('rose')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-rose" />
                        Rose
                      </button>
                      <button
                        type="button"
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => applyTextColor('white')}
                        className="dropdown-item color-dropdown-item"
                      >
                        <span className="color-swatch color-swatch-white" />
                        White
                      </button>
                    </div>
                  )}
                </div>
                <div className="toolbar-divider"></div>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => runEditorCommand(() => editor?.chain().focus().toggleBulletList().run())}
                  className={`toolbar-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
                  title="Bullet List"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="6" r="2" /><circle cx="4" cy="12" r="2" /><circle cx="4" cy="18" r="2" /><rect x="9" y="5" width="12" height="2" /><rect x="9" y="11" width="12" height="2" /><rect x="9" y="17" width="12" height="2" /></svg>
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => runEditorCommand(() => editor?.chain().focus().toggleOrderedList().run())}
                  className={`toolbar-btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
                  title="Numbered List"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><text x="1" y="8" fontSize="8" fontWeight="bold">1.</text><text x="1" y="14" fontSize="8" fontWeight="bold">2.</text><text x="1" y="20" fontSize="8" fontWeight="bold">3.</text><rect x="9" y="5" width="12" height="2" /><rect x="9" y="11" width="12" height="2" /><rect x="9" y="17" width="12" height="2" /></svg>
                </button>
                <div className="toolbar-divider"></div>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => runEditorCommand(() => editor?.chain().focus().toggleBlockquote().run())}
                  className={`toolbar-btn ${editor?.isActive('blockquote') ? 'active' : ''}`}
                  title="Quote"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
                </button>
                <button type="button" onMouseDown={handleToolbarMouseDown} onClick={openLinkModal} className="toolbar-btn" title="Insert Link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                </button>
                <div className="toolbar-divider"></div>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => applyTextAlign('left')}
                  className={`toolbar-btn ${editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                  title="Align Left"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" rx="1" /><rect x="3" y="11" width="12" height="2" rx="1" /><rect x="3" y="17" width="18" height="2" rx="1" /></svg>
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => applyTextAlign('center')}
                  className={`toolbar-btn ${editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                  title="Align Center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" rx="1" /><rect x="6" y="11" width="12" height="2" rx="1" /><rect x="3" y="17" width="18" height="2" rx="1" /></svg>
                </button>
                <button
                  type="button"
                  onMouseDown={handleToolbarMouseDown}
                  onClick={() => applyTextAlign('right')}
                  className={`toolbar-btn ${editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                  title="Align Right"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" rx="1" /><rect x="9" y="11" width="12" height="2" rx="1" /><rect x="3" y="17" width="18" height="2" rx="1" /></svg>
                </button>
                <button type="button" onMouseDown={handleToolbarMouseDown} onClick={triggerImageUpload} className="toolbar-btn" title="Insert Image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </button>
                {editor?.isActive('table') && (
                  <>
                    <div className="toolbar-divider"></div>
                    <span className="toolbar-status-pill">Table Selected</span>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('addRowBefore')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Add Row Above"
                    >
                      Row +
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('addRowAfter')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Add Row Below"
                    >
                      Row +B
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('addColumnBefore')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Add Column Left"
                    >
                      Col +
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('addColumnAfter')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Add Column Right"
                    >
                      Col +R
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('deleteRow')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Delete Row"
                    >
                      Row -
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('deleteColumn')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Delete Column"
                    >
                      Col -
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => applyRowHeight('compact')}
                      className={`toolbar-btn toolbar-text-btn ${editor?.isActive('tableRow', { rowHeight: 'compact' }) ? 'active' : ''}`}
                      title="Compact Row Height"
                    >
                      Row S
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => applyRowHeight('normal')}
                      className={`toolbar-btn toolbar-text-btn ${!editor?.isActive('tableRow', { rowHeight: 'compact' }) && !editor?.isActive('tableRow', { rowHeight: 'tall' }) ? 'active' : ''}`}
                      title="Normal Row Height"
                    >
                      Row M
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => applyRowHeight('tall')}
                      className={`toolbar-btn toolbar-text-btn ${editor?.isActive('tableRow', { rowHeight: 'tall' }) ? 'active' : ''}`}
                      title="Tall Row Height"
                    >
                      Row L
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => moveSelectedTable('up')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Move Table Up"
                    >
                      Move Up
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => moveSelectedTable('down')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Move Table Down"
                    >
                      Move Down
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleToolbarMouseDown}
                      onClick={() => updateTableStructure('deleteTable')}
                      className="toolbar-btn toolbar-text-btn"
                      title="Delete Table"
                    >
                      Delete
                    </button>
                  </>
                )}
                <div className="toolbar-dropdown">
                  <button
                    type="button"
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => setShowTableMenu((prev) => !prev)}
                    className={`toolbar-btn toolbar-dropdown-btn ${editor?.isActive('table') ? 'active' : ''}`}
                    title="Insert Table"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
                  </button>
                  {showTableMenu && (
                    <div
                      className="toolbar-dropdown-menu table-picker-menu"
                      onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}
                    >
                      <p className="table-picker-label">
                        {tableHover.rows > 0 && tableHover.cols > 0 ? `${tableHover.rows} × ${tableHover.cols} table` : 'Select table size'}
                      </p>
                      <div className="table-picker-grid">
                        {Array.from({ length: 6 }, (_, r) =>
                          Array.from({ length: 6 }, (_, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`table-picker-cell ${r < tableHover.rows && c < tableHover.cols ? 'hovered' : ''}`}
                              onMouseEnter={() => setTableHover({ rows: r + 1, cols: c + 1 })}
                              onMouseDown={handleToolbarMouseDown}
                              onClick={() => insertTable(r + 1, c + 1)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="content-area wysiwyg-mode">
                <EditorContent editor={editor} className="content-input tiptap-editor" />
                <input
                  type="file"
                  id="contentImages"
                  accept="image/*"
                  onChange={handleContentImageChange}
                  style={{ display: 'none' }}
                />
                {contentImages.length > 0 && (
                  <div className="uploaded-images-section">
                    <p className="uploaded-images-label">Inline images in this article</p>
                    <div className="uploaded-images-grid">
                      {contentImages.map((img) => (
                        <div key={img.id} className="uploaded-image-item">
                          <img src={img.preview} alt="Uploaded" />
                          <div className="uploaded-image-info">
                            <span className="uploaded-image-id">{img.id}</span>
                            <button
                              type="button"
                              onClick={() => removeContentImage(img.id)}
                              className="uploaded-image-remove"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {formData.contentType === 'file' && (
            <div className="file-upload-notice">
              <p>Content will be extracted from the uploaded document.</p>
              <p>
                {editingBlog
                  ? 'Upload a new PDF or DOCX from Settings to replace the current article body.'
                  : 'Go to Settings above to select your PDF or DOCX file.'}
              </p>
            </div>
          )}
        </div>

        <div className="draft-indicator">
          <span className="draft-dot"></span>
          {isLoadingBlog ? 'Loading draft...' : draftStatus}
        </div>
      </form>
    </div>
  );
}

function extractContentFromComponent(componentStr: string): string {
  let content = componentStr;

  content = content.replace(/^import[\s\S]*?;\s*/gm, '');
  content = content.replace(/export default function[\s\S]*?return\s*\(/, '');
  content = content.replace(/\)\s*;\s*\}\s*$/, '');
  content = content.replace(/<>|<\/>/g, '');
  content = content.replace(/&lt;&gt;/g, '');
  content = content.replace(/&bull;/gi, '•');
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  content = content.replace(/\{\s*' '\s*\}|\{\s*" "\s*\}/g, ' ');
  content = content.replace(/\s*style=\{\{[^}]*\}\}/g, '');
  content = content.replace(/\bclassName=/g, 'class=');
  content = content.replace(/\bcolSpan=/g, 'colspan=');
  content = content.replace(/\browSpan=/g, 'rowspan=');
  content = content.replace(/^\s*\}\s*$/gm, '');
  content = content.trim();

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div data-editor-root>${content}</div>`, 'text/html');
    const wrapper =
      doc.querySelector('.blog-content-wrapper') ||
      doc.querySelector('[data-editor-root]');

    if (wrapper) {
      wrapper.querySelectorAll('.cta-box, .key-takeaways, script, style').forEach((node) => node.remove());
      return wrapper.innerHTML
        .replace(/&lt;&gt;/g, '')
        .replace(/<>|<\/>/g, '')
        .replace(/&bull;/gi, '•')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
  }

  content = content.replace(/<div class="blog-content-wrapper">\s*/g, '');
  content = content.replace(/<div className="blog-content-wrapper">\s*/g, '');
  content = content.replace(/\s*<\/div>\s*$/, '');
  content = content.replace(/<div class="cta-box">[\s\S]*?<\/div>/g, '');
  content = content.replace(/<div className="cta-box">[\s\S]*?<\/div>/g, '');
  content = content.replace(/<div class="key-takeaways">[\s\S]*?<\/div>/g, '');
  content = content.replace(/<div className="key-takeaways">[\s\S]*?<\/div>/g, '');
  content = content.replace(/&bull;/gi, '•');
  content = content.replace(/\n{3,}/g, '\n\n');
  return content.trim();
}
