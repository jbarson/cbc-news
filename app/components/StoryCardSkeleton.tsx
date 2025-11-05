interface StoryCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

export default function StoryCardSkeleton({ viewMode }: StoryCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <article className="story-card story-card-list story-card-skeleton">
        <div className="skeleton-title" />
        <div className="skeleton-content" />
      </article>
    );
  }

  return (
    <article className="story-card story-card-skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-content-line" />
      <div className="skeleton-content-line" />
      <div className="skeleton-content-line skeleton-content-line-short" />
      <div className="skeleton-meta" />
    </article>
  );
}
