import React from 'react';
import PrimaryButton from './PrimaryButton';
import ThematicContainer from './ThematicContainer';

interface ReviewViewProps {
  videoBlob: Blob;
  selfieBlob: Blob;
  onSubmit: () => void;
  onRetakeVideo: () => void;
  onRetakeSelfie: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({
  videoBlob,
  selfieBlob,
  onSubmit,
  onRetakeVideo,
  onRetakeSelfie,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-4 px-4">
        <h2 className="text-xl font-bold text-white mb-1">Review Your Submission</h2>
        <p className="text-xs text-gray-400">
          Check your video and selfie before submitting
        </p>
      </div>

      {/* BeReal Style Media Display */}
      <div className="relative w-full max-w-sm mb-4 px-4">
        {/* Main Video */}
        <div className="w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden">
          <video 
            src={URL.createObjectURL(videoBlob)} 
            controls 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Selfie in corner with ThematicContainer frame */}
        <div className="absolute top-3 right-7">
          <ThematicContainer
            color="nocenaPurple"
            glassmorphic={true}
            rounded="xl"
            asButton={false}
            className="p-0.5"
          >
            <div className="w-24 h-32 bg-black rounded-xl overflow-hidden">
              <img 
                src={URL.createObjectURL(selfieBlob)} 
                alt="Selfie" 
                className="w-full h-full object-cover"
              />
            </div>
          </ThematicContainer>
        </div>
      </div>

      {/* Buttons Container */}
      <div className="w-full max-w-sm px-4 space-y-8">
        {/* Retake buttons */}
        <div className="flex gap-4">
          <ThematicContainer
            color="nocenaBlue"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeVideo}
            className="flex-1 py-2.5 px-6 text-sm text-center"
          >
            Retake Video
          </ThematicContainer>
          
          <ThematicContainer
            color="nocenaPurple"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeSelfie}
            className="ml-3 flex-1 py-2.5 px-6 text-sm text-center"
          >
            Retake Selfie
          </ThematicContainer>
        </div>

        {/* Submit button */}
        <PrimaryButton
          text="SUBMIT FOR VERIFICATION"
          onClick={onSubmit}
          className="w-full"
        />
      </div>

      {/* Compact status */}
      <div className="text-center text-xs text-gray-400 px-4 mt-4">
        <p>By submitting, you confirm this is your authentic completion</p>
      </div>
    </div>
  );
};

export default ReviewView;