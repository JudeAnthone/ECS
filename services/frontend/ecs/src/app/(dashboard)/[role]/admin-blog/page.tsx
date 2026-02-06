"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/TextArea';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import { 
  FileText,
  Send,
  Image as Imagery,
  Link as LinkIcon,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Eye
} from 'lucide-react';

import Image from 'next/image';

export default function BlogManagement() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Sample blog posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Announcing New Extension Services Portal',
      content: 'We are excited to announce the launch of our new Extension Services Portal. This platform will streamline project management and improve collaboration across all departments. The portal includes features such as real-time project tracking, budget management, and automated reporting.',
      imageUrl: '',
      author: 'Admin',
      date: '2026-01-30',
      views: 245,
      status: 'Published'
    },
    {
      id: 2,
      title: 'Q1 2026 Performance Review',
      content: 'Our teams have achieved remarkable results in Q1 2026. Key highlights include successful completion of 15 major projects, 92% on-time delivery rate, and excellent budget management with only 3 projects exceeding their allocated budgets. Check out the detailed analytics in our dashboard.',
      imageUrl: '',
      author: 'Admin',
      date: '2026-01-28',
      views: 189,
      status: 'Published'
    },
    {
      id: 3,
      title: 'New Security Protocols Implementation',
      content: 'As part of our ongoing commitment to data security, we will be implementing new security protocols across all systems. All users are required to update their passwords and enable two-factor authentication by February 15, 2026. Training sessions will be conducted next week.',
      imageUrl: '',
      author: 'Admin',
      date: '2026-01-25',
      views: 312,
      status: 'Published'
    },
    {
      id: 4,
      title: 'Team Spotlight: Engineering Department',
      content: 'This month, we recognize the Engineering Department for their exceptional work on the Digital Transformation Initiative. The team has consistently exceeded expectations and delivered innovative solutions. Special thanks to Sarah Chen and David Kim for their leadership.',
      imageUrl: '',
      author: 'Admin',
      date: '2026-01-22',
      views: 156,
      status: 'Published'
    },
    {
      id: 5,
      title: 'Upcoming Training Workshop Schedule',
      content: 'We are pleased to announce the schedule for our upcoming training workshops. Topics include Project Management Best Practices, Advanced Excel for Data Analysis, and Effective Communication in Remote Teams. Registration is now open on the HR portal.',
      imageUrl: '',
      author: 'Admin',
      date: '2026-01-20',
      views: 423,
      status: 'Published'
    }
  ]);

  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const handleInsertImage = () => {
    if (imageUrl) {
      setContent(content + `\n[IMAGE:${imageUrl}]\n`);
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      setContent(content + `[LINK:${linkText}|${linkUrl}]`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
    }
  };

  const handlePublishPost = () => {
    if (title && content) {
      const newPost = {
        id: posts.length + 1,
        title,
        content,
        imageUrl: imageUrl || '',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        views: 0,
        status: 'Published'
      };
      setPosts([newPost, ...posts]);
      setTitle('');
      setContent('');
      setImageUrl('');
      alert('Blog post published successfully!');
    } else {
      alert('Please fill in both title and content');
    }
  };

  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(postId);
      setEditTitle(post.title);
      setEditContent(post.content);
      setEditImageUrl(post.imageUrl);
    }
  };

  const handleSaveEdit = (postId: number) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, title: editTitle, content: editContent, imageUrl: editImageUrl }
        : p
    ));
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setEditImageUrl('');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setEditImageUrl('');
  };

  const handleDeletePost = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const renderContent = (content: string) => {
    // Parse content for images and links
    let renderedContent = content;
    
    // Replace image placeholders
    const imageRegex = /\[IMAGE:(.*?)\]/g;
    renderedContent = renderedContent.replace(imageRegex, (match, url) => {
      return `<img src="${url}" alt="Blog image" class="w-full rounded-lg my-4" />`;
    });

    // Replace link placeholders
    const linkRegex = /\[LINK:(.*?)\|(.*?)\]/g;
    renderedContent = renderedContent.replace(linkRegex, (match, text, url) => {
      return `<a href="${url}" target="_blank" class="text-blue-600 underline hover:text-blue-800">${text}</a>`;
    });

    return { __html: renderedContent };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Blog Management
            </h1>
            <p className="text-slate-600 text-lg">Create and manage blog posts</p>
          </div>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            <FileText className="h-4 w-4 mr-2" />
            {posts.length} Posts
          </Badge>
        </div>

        {/* Create New Post Section */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 text-2xl">Create New Post</CardTitle>
            <CardDescription className="text-slate-600">
              Write and publish a new blog post with images and links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Post Title
              </label>
              <Input
                type="text"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Post Content
              </label>
              <Textarea
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 min-h-[200px]"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageInput(!showImageInput)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Imagery className="h-4 w-4 mr-2" />
                Insert Image
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Insert Link
              </Button>
            </div>

            {/* Image Input */}
            {showImageInput && (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900"
                />
                <Button onClick={handleInsertImage} className="bg-blue-600 hover:bg-blue-700">
                  Insert
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageInput(false)}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Link Input */}
            {showLinkInput && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Link text..."
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                  <Input
                    type="text"
                    placeholder="Link URL..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleInsertLink} className="bg-blue-600 hover:bg-blue-700">
                    Insert Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLinkInput(false)}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Publish Button */}
            <div className="pt-4">
              <Button 
                onClick={handlePublishPost}
                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                Publish Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts Section */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 text-2xl">Recent Blog Posts</CardTitle>
            <CardDescription className="text-slate-600">
              View, edit, or delete your published posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] pr-4">
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {editingPost === post.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <Input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white border-slate-300 text-slate-900 font-bold text-lg"
                          />
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-white border-slate-300 text-slate-900 min-h-[150px]"
                          />
                          <Input
                            type="text"
                            placeholder="Image URL (optional)"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            className="bg-white border-slate-300 text-slate-900"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleSaveEdit(post.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Save Changes
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-slate-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{post.views} views</span>
                                </div>
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                  {post.status}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                <DropdownMenuItem 
                                  onClick={() => handleEditPost(post.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                  <span>Edit Post</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="cursor-pointer text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete Post</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Post Image */}
                          {post.imageUrl && (
                            <Image 
                              src={post.imageUrl} 
                              alt={post.title}
                              className="w-full rounded-lg mb-4 max-h-96 object-cover"
                            />
                          )}

                          {/* Post Content */}
                          <div 
                            className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={renderContent(post.content)}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}