type CaptionedVideo = {
  src: string;
  poster: string;
  captions: string;
};

type ClientStory = {
  name: string;
  topic: string;
  quote: string;
  video: CaptionedVideo;
};

// Add the published MP4, poster and WebVTT paths once the clips and wording are approved.
export const homepageMedia: {
  introduction: CaptionedVideo | null;
  clientStories: readonly ClientStory[];
} = {
  introduction: null,
  clientStories: [],
};
