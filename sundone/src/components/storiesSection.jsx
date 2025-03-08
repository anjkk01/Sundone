import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const StoryViewer = ({ stories }) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    const currentUserStories = stories[currentUserIndex];
    const currentStory = currentUserStories[currentStoryIndex];

    useEffect(() => {
        const timer = setTimeout(() => {
            nextStory();
        }, 3000); // Auto move to next story after 3 seconds
        return () => clearTimeout(timer);
    }, [currentStoryIndex, currentUserIndex]);

    const nextStory = () => {
        if (currentStoryIndex < currentUserStories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else if (currentUserIndex < stories.length - 1) {
            setCurrentUserIndex(currentUserIndex + 1);
            setCurrentStoryIndex(0);
        }
    };

    const prevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else if (currentUserIndex > 0) {
            setCurrentUserIndex(currentUserIndex - 1);
            setCurrentStoryIndex(stories[currentUserIndex - 1].length - 1);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black">
        <IconButton onClick={prevStory}
            sx={{
                color: 'white', 
                backgroundColor: 'transparent', 
                '&:hover': { backgroundColor: 'transparent', opacity: 0.8 }
            }}
        className="rounded-full">
            <ArrowBackIos />
        </IconButton>

            <div className="relative max-w-md w-full h-3/4 rounded-xl overflow-hidden">
                <img src={currentStory.url} alt="Story" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent text-white">
                    <h3>@{currentStory.userid_table.username}</h3>
                </div>
            </div>

        <IconButton onClick={nextStory}
                                sx={{
                                    color: 'white', 
                                    backgroundColor: 'transparent', 
                                    '&:hover': { backgroundColor: 'transparent', opacity: 0.8 }
                                }}
        className="rounded-full">
            <ArrowForwardIos />
        </IconButton>
        </div>
    );
};

const StoryThumbnails = ({ stories, onThumbnailClick }) => {
    return (
        <div className="flex space-x-4 overflow-x-auto p-2">
            {stories.map((userStories, index) => (
                <div key={index} onClick={() => onThumbnailClick(index)} className="cursor-pointer">
                    <img
                        src={userStories[0].url} 
                        alt="Story"
                        className="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
                    />
                    <p className="text-xs text-center text-gray-600">@{userStories[0].userid_table.username}</p>
                </div>
            ))}
        </div>
    );
};

export default function IntegratedStoryViewer({ stories }) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);

    const openViewer = (index) => {
        setSelectedUserIndex(index);
        setIsViewerOpen(true);
    };

    const closeViewer = () => setIsViewerOpen(false);

    return (
        <div>
            <StoryThumbnails stories={stories} onThumbnailClick={openViewer} />
            {isViewerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
                    <StoryViewer stories={stories} />
                    <button onClick={closeViewer} className="absolute top-4 right-4 text-white text-xl">&times;</button>
                </div>
            )}
        </div>
    );
}
