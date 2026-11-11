<#
.SYNOPSIS
  Generates every app icon Mise needs from a single source image.

.DESCRIPTION
  The source can be a screenshot of the icon on a flat background: the background
  around the icon is removed (keeping the rounded corners anti-aliased) and the
  icon is cropped before resizing. Outputs:

    public/favicon.ico                16, 32, 48 px (browser tab)
    public/apple-touch-icon.png       180 px, opaque (iOS home screen)
    public/icons/icon-192.png         transparent corners (installed app)
    public/icons/icon-512.png
    public/icons/maskable-192.png     full-bleed square (Android adaptive icons)
    public/icons/maskable-512.png

  Run with:  npm run icons
  Requires Windows PowerShell (uses System.Drawing).
#>
param(
  [string]$Source = (Join-Path $PSScriptRoot '..\resources\app-icon.png'),
  [string]$PublicDir = (Join-Path $PSScriptRoot '..\public')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class MiseIconTools
{
    static int[] ReadPixels(Bitmap bmp)
    {
        var data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        var pixels = new int[bmp.Width * bmp.Height];
        Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
        bmp.UnlockBits(data);
        return pixels;
    }

    static Bitmap WritePixels(int[] pixels, int width, int height)
    {
        var bmp = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        var data = bmp.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
        bmp.UnlockBits(data);
        return bmp;
    }

    static int Clamp(double value) { return value < 0 ? 0 : value > 255 ? 255 : (int)Math.Round(value); }

    /// <summary>
    /// Removes the flat background surrounding an icon and crops to it. The background is
    /// found by flood-filling from the image border, so dark areas inside the icon are kept.
    /// Pixels along the icon outline get fractional alpha to preserve anti-aliasing.
    /// </summary>
    public static Bitmap ExtractIcon(Bitmap source, double threshold, double noise)
    {
        int w = source.Width, h = source.Height;
        int[] px = ReadPixels(source);

        // Background colour: average of the four corner patches.
        long sr = 0, sg = 0, sb = 0; int count = 0;
        int[] cornerX = { 0, w - 4, 0, w - 4 };
        int[] cornerY = { 0, 0, h - 4, h - 4 };
        for (int c = 0; c < 4; c++)
            for (int y = cornerY[c]; y < cornerY[c] + 4; y++)
                for (int x = cornerX[c]; x < cornerX[c] + 4; x++)
                {
                    int p = px[y * w + x];
                    sr += (p >> 16) & 255; sg += (p >> 8) & 255; sb += p & 255; count++;
                }
        double bgR = sr / (double)count, bgG = sg / (double)count, bgB = sb / (double)count;

        var dist = new double[w * h];
        for (int i = 0; i < px.Length; i++)
        {
            double dr = ((px[i] >> 16) & 255) - bgR, dg = ((px[i] >> 8) & 255) - bgG, db = (px[i] & 255) - bgB;
            dist[i] = Math.Sqrt(dr * dr + dg * dg + db * db);
        }

        // Flood fill the background from the border.
        var isBg = new bool[w * h];
        var queue = new Queue<int>();
        for (int x = 0; x < w; x++) { queue.Enqueue(x); queue.Enqueue((h - 1) * w + x); }
        for (int y = 0; y < h; y++) { queue.Enqueue(y * w); queue.Enqueue(y * w + w - 1); }
        while (queue.Count > 0)
        {
            int i = queue.Dequeue();
            if (isBg[i] || dist[i] >= threshold) continue;
            isBg[i] = true;
            int x = i % w, y = i / w;
            if (x > 0) queue.Enqueue(i - 1);
            if (x < w - 1) queue.Enqueue(i + 1);
            if (y > 0) queue.Enqueue(i - w);
            if (y < h - 1) queue.Enqueue(i + w);
        }

        // Bounding box and centre of the icon.
        int minX = w, minY = h, maxX = -1, maxY = -1;
        for (int i = 0; i < isBg.Length; i++)
        {
            if (isBg[i]) continue;
            int x = i % w, y = i / w;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        if (maxX < 0) throw new InvalidOperationException("No icon found in the source image.");
        double cx = (minX + maxX) / 2.0, cy = (minY + maxY) / 2.0;

        // Alpha: 0 for background, 1 inside, fractional in a 2px band around the outline.
        var output = new int[w * h];
        const int band = 2;
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                int i = y * w + x;
                bool nearBg = false, nearIcon = false;
                for (int dy = -band; dy <= band; dy++)
                    for (int dx = -band; dx <= band; dx++)
                    {
                        int nx = x + dx, ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearBg = true; continue; }
                        if (isBg[ny * w + nx]) nearBg = true; else nearIcon = true;
                    }

                int p = px[i];
                if (!nearIcon) { output[i] = 0; continue; }
                if (!nearBg) { output[i] = p | unchecked((int)0xFF000000); continue; }

                // Sample a solid icon colour a few pixels towards the centre.
                double vx = cx - x, vy = cy - y, len = Math.Sqrt(vx * vx + vy * vy);
                if (len < 1) len = 1;
                int ix = Math.Max(0, Math.Min(w - 1, (int)Math.Round(x + vx / len * 5)));
                int iy = Math.Max(0, Math.Min(h - 1, (int)Math.Round(y + vy / len * 5)));
                int inner = px[iy * w + ix];
                double innerDist = Math.Max(dist[iy * w + ix] - noise, 1);

                double a = (dist[i] - noise) / innerDist;
                if (a <= 0.02) { output[i] = 0; continue; }
                if (a > 1) a = 1;

                // Un-blend the background from the edge pixel; fall back to the inner colour.
                double r = (((p >> 16) & 255) - (1 - a) * bgR) / a;
                double g = (((p >> 8) & 255) - (1 - a) * bgG) / a;
                double b = ((p & 255) - (1 - a) * bgB) / a;
                double mix = a < 0.35 ? 1 : 0.3; // very faint pixels are too noisy to un-blend
                r = r * (1 - mix) + ((inner >> 16) & 255) * mix;
                g = g * (1 - mix) + ((inner >> 8) & 255) * mix;
                b = b * (1 - mix) + (inner & 255) * mix;
                output[i] = (Clamp(a * 255) << 24) | (Clamp(r) << 16) | (Clamp(g) << 8) | Clamp(b);
            }
        }

        using (var keyed = WritePixels(output, w, h))
        {
            return keyed.Clone(new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1), PixelFormat.Format32bppArgb);
        }
    }

    static Bitmap ResizeOnce(Bitmap source, int width, int height)
    {
        var result = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(result))
        using (var attributes = new ImageAttributes())
        {
            attributes.SetWrapMode(WrapMode.TileFlipXY); // avoids dark fringes at the edges
            g.CompositingMode = CompositingMode.SourceCopy;
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.DrawImage(source, new Rectangle(0, 0, width, height), 0, 0, source.Width, source.Height, GraphicsUnit.Pixel, attributes);
        }
        return result;
    }

    /// <summary>Resizes to a square, halving in steps for large reductions to stay sharp.</summary>
    public static Bitmap ResizeSquare(Bitmap source, int size)
    {
        Bitmap current = source;
        bool owned = false;
        while (current.Width / 2 >= size * 1.5 && current.Height / 2 >= size * 1.5)
        {
            var next = ResizeOnce(current, current.Width / 2, current.Height / 2);
            if (owned) current.Dispose();
            current = next; owned = true;
        }
        var result = ResizeOnce(current, size, size);
        if (owned) current.Dispose();
        return result;
    }

    /// <summary>
    /// Produces an opaque square for iOS and Android maskable icons by filling the
    /// transparent rounded corners with the icon's own edge colour, so there is no seam.
    /// </summary>
    public static Bitmap FullBleed(Bitmap icon, int size)
    {
        using (var scaled = ResizeSquare(icon, size))
        {
            int[] px = ReadPixels(scaled);
            var output = new int[px.Length];
            double c = (size - 1) / 2.0;
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    int i = y * size + x;
                    int p = px[i];
                    int a = (p >> 24) & 255;
                    if (a == 255) { output[i] = p; continue; }

                    // Walk towards the centre until reaching a fully opaque pixel.
                    double vx = c - x, vy = c - y, len = Math.Sqrt(vx * vx + vy * vy);
                    int fill = p | unchecked((int)0xFF000000);
                    for (double t = 1; t < len; t += 1)
                    {
                        int sx = (int)Math.Round(x + vx / len * t), sy = (int)Math.Round(y + vy / len * t);
                        int q = px[sy * size + sx];
                        if (((q >> 24) & 255) == 255)
                        {
                            // Step further in to skip the icon's light bevel along its outline.
                            double depth = t + Math.Max(3, size / 64.0);
                            int ix = (int)Math.Round(x + vx / len * depth), iy = (int)Math.Round(y + vy / len * depth);
                            fill = px[iy * size + ix] | unchecked((int)0xFF000000);
                            break;
                        }
                    }
                    output[i] = fill;
                }
            }

            // Smooth the filled corners so neighbouring rays don't leave streaks, then
            // composite the icon's anti-aliased outline on top.
            int radius = Math.Max(2, size / 40);
            var result = new int[px.Length];
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    int i = y * size + x;
                    int p = px[i];
                    int a = (p >> 24) & 255;
                    if (a == 255) { result[i] = p; continue; }

                    long sr = 0, sg = 0, sb = 0; int n = 0;
                    for (int dy = -radius; dy <= radius; dy++)
                        for (int dx = -radius; dx <= radius; dx++)
                        {
                            int nx = x + dx, ny = y + dy;
                            if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
                            int q = output[ny * size + nx];
                            sr += (q >> 16) & 255; sg += (q >> 8) & 255; sb += q & 255; n++;
                        }
                    double alpha = a / 255.0;
                    int r = Clamp(((p >> 16) & 255) * alpha + sr / (double)n * (1 - alpha));
                    int g = Clamp(((p >> 8) & 255) * alpha + sg / (double)n * (1 - alpha));
                    int b = Clamp((p & 255) * alpha + sb / (double)n * (1 - alpha));
                    result[i] = unchecked((int)0xFF000000) | (r << 16) | (g << 8) | b;
                }
            }
            return WritePixels(result, size, size);
        }
    }

    /// <summary>Writes a .ico containing PNG-compressed images (supported by all modern browsers).</summary>
    public static void WriteIco(Bitmap icon, int[] sizes, string path)
    {
        var images = new List<byte[]>();
        foreach (int size in sizes)
            using (var resized = ResizeSquare(icon, size))
            using (var stream = new MemoryStream())
            {
                resized.Save(stream, ImageFormat.Png);
                images.Add(stream.ToArray());
            }

        using (var file = new FileStream(path, FileMode.Create))
        using (var writer = new BinaryWriter(file))
        {
            writer.Write((short)0);            // reserved
            writer.Write((short)1);            // type: icon
            writer.Write((short)sizes.Length); // image count
            int offset = 6 + 16 * sizes.Length;
            for (int i = 0; i < sizes.Length; i++)
            {
                writer.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i]));
                writer.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i]));
                writer.Write((byte)0);    // palette
                writer.Write((byte)0);    // reserved
                writer.Write((short)1);   // colour planes
                writer.Write((short)32);  // bits per pixel
                writer.Write(images[i].Length);
                writer.Write(offset);
                offset += images[i].Length;
            }
            foreach (var image in images) writer.Write(image);
        }
    }
}
'@

$Source = (Resolve-Path $Source).Path
$PublicDir = (Resolve-Path $PublicDir).Path
$iconsDir = Join-Path $PublicDir 'icons'
New-Item -ItemType Directory -Force $iconsDir | Out-Null

$sourceImage = [System.Drawing.Bitmap]::FromFile($Source)
try {
  $icon = [MiseIconTools]::ExtractIcon($sourceImage, 60, 12)
  Write-Host ("Source {0}x{1} -> icon {2}x{3}" -f $sourceImage.Width, $sourceImage.Height, $icon.Width, $icon.Height)

  $outputs = @(
    @{ Path = (Join-Path $iconsDir 'icon-192.png'); Size = 192; FullBleed = $false },
    @{ Path = (Join-Path $iconsDir 'icon-512.png'); Size = 512; FullBleed = $false },
    @{ Path = (Join-Path $iconsDir 'maskable-192.png'); Size = 192; FullBleed = $true },
    @{ Path = (Join-Path $iconsDir 'maskable-512.png'); Size = 512; FullBleed = $true },
    @{ Path = (Join-Path $PublicDir 'apple-touch-icon.png'); Size = 180; FullBleed = $true }
  )
  foreach ($output in $outputs) {
    $image = if ($output.FullBleed) { [MiseIconTools]::FullBleed($icon, $output.Size) } else { [MiseIconTools]::ResizeSquare($icon, $output.Size) }
    $image.Save($output.Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $image.Dispose()
    Write-Host "  wrote $($output.Path)"
  }

  $icoPath = Join-Path $PublicDir 'favicon.ico'
  [MiseIconTools]::WriteIco($icon, [int[]](16, 32, 48), $icoPath)
  Write-Host "  wrote $icoPath"
  $icon.Dispose()
}
finally {
  $sourceImage.Dispose()
}
