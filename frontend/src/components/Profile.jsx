import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-13'>
      <div className='flex flex-col gap-20 p-4'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-52 w-52'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center font-bold text-3xl gap-2'>
                <span>{userProfile?.username}</span>
                </div>
              
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers.length} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio }</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                <span>Actor</span>
                <span>Karmanye vadhikaraste ma phaleshu kadachana🙏✨</span>
                <span>Dm/mail for collabs♥️</span>
                
              </div>

              <div className='flex items-center gap-2'>

                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 bg-gray-100 h-8'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8 bg-gray-100'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8  bg-gray-100'>Ad tools</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button variant='secondary' className=' h-12 w-50'>Unfollow</Button>
                        <Button variant='secondary' className='h-12 w-50'>Message</Button>
                      </>
                    ) : (
                      <Button className='bg-[#1877F2] hover:bg-[#3192d2] text-white font-bold h-12 w-100 '>Follow</Button>
                    )
                  )
                }
              </div> 
            </div>
          </section>
        </div>
        <div className=' ml-30 border-t border-t-gray-200'> 
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'reels' ? 'font-bold' : ''}`} onClick={() => handleTabChange('reels')}>REELS</span>
            <span className={`py-3 cursor-pointer ${activeTab === 'tags' ? 'font-bold' : ''}`} onClick={() => handleTabChange('tags')}>TAGS</span>
          </div>
          <div className='grid grid-cols-3 gap-1 '>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover '  />
                    
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-40 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'> 
                        {/* //inset-0 means */}
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile